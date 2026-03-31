"use client";

import DriveGallery from "@/components/drive-gallery";
import FaceIndexBuilder from "@/components/face-index-builder";
import type {
  FaceSearchDescriptorEntry,
  SearchableDriveImage,
} from "@/lib/face-search-types";
import type { DriveImage } from "@/lib/google-drive";
import { useEffect, useMemo, useRef, useState } from "react";

type FaceSearchPanelProps = {
  images: SearchableDriveImage[];
  descriptorEntries?: FaceSearchDescriptorEntry[];
};

type SearchMatch = SearchableDriveImage & {
  score: number;
};

type FaceApiDescriptor = Float32Array;

type FaceApiDetection = {
  descriptor: FaceApiDescriptor;
};

type FaceApiModule = {
  nets: {
    ssdMobilenetv1: { loadFromUri(uri: string): Promise<void> };
    faceLandmark68Net: { loadFromUri(uri: string): Promise<void> };
    faceRecognitionNet: { loadFromUri(uri: string): Promise<void> };
  };
  detectSingleFace(
    input: HTMLImageElement,
  ): {
    withFaceLandmarks(): {
      withFaceDescriptor(): Promise<FaceApiDetection | undefined>;
    };
  };
  detectAllFaces(
    input: HTMLImageElement,
  ): {
    withFaceLandmarks(): {
      withFaceDescriptors(): Promise<FaceApiDetection[]>;
    };
  };
  euclideanDistance(
    first: FaceApiDescriptor,
    second: FaceApiDescriptor,
  ): number;
};

const FACE_API_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const FACE_API_MODELS_URL =
  "https://justadudewhohacks.github.io/face-api.js/models";

let faceApiLoader: Promise<FaceApiModule> | null = null;
const descriptorCache = new Map<string, Promise<FaceApiDescriptor[]>>();
const SEARCH_CONCURRENCY = 10;
const STORAGE_KEY = "face-search-state-v1";

const SEARCH_MODES = [
  {
    id: "accurate",
    label: "Accurate",
    threshold: 0.5,
    helpText: "Fewer wrong matches, but may miss some photos.",
  },
  {
    id: "balanced",
    label: "Balanced",
    threshold: 0.53,
    helpText: "Best mix of accuracy and more results.",
  },
  // {
  //   id: "wide",
  //   label: "Wide",
  //   threshold: 0.57,
  //   helpText: "Finds more photos, but can include wrong people.",
  // },
] as const;

type SearchModeId = (typeof SEARCH_MODES)[number]["id"];

type PersistedState = {
  matches: SearchMatch[];
  status: string;
  searchMode: SearchModeId;
};

function getProxyImageUrl(id: string, size = 1200) {
  return `/api/drive/image/${id}?size=${size}`;
}

function revokePreviewUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function buildDriveImage(id: string): DriveImage {
  return {
    id,
    thumbSources: [
      getProxyImageUrl(id, 900),
      getProxyImageUrl(id, 1200),
    ],
    fullSources: [
      getProxyImageUrl(id, 1600),
      getProxyImageUrl(id, 2000),
    ],
  };
}

function getAlbumNameByImageId(
  matches: SearchMatch[],
  imageId: string,
) {
  return matches.find((match) => match.id === imageId)?.albumTitle ?? "";
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Script could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Script could not be loaded.")),
      { once: true },
    );

    document.head.appendChild(script);
  });
}

async function loadFaceApi() {
  if (!faceApiLoader) {
    faceApiLoader = (async () => {
      await loadScript(FACE_API_SCRIPT_URL);
      const faceapi = (window as Window & { faceapi?: FaceApiModule }).faceapi;

      if (!faceapi) {
        throw new Error("Face API did not initialize.");
      }

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_API_MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_MODELS_URL),
      ]);

      return faceapi;
    })();
  }

  return faceApiLoader;
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = src;
  });
}

async function getFaceDescriptor(faceapi: FaceApiModule, imageSrc: string) {
  const image = await loadImageElement(imageSrc);

  const result = await faceapi
    .detectSingleFace(image)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return result?.descriptor;
}

async function getFaceDescriptors(faceapi: FaceApiModule, imageSrc: string) {
  const image = await loadImageElement(imageSrc);
  const results = await faceapi
    .detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return results.map((result) => result.descriptor);
}

function sortMatches(matches: SearchMatch[]) {
  return [...matches].sort((first, second) => first.score - second.score);
}

function toFaceApiDescriptors(entry: FaceSearchDescriptorEntry) {
  const rawDescriptors =
    entry.descriptors && entry.descriptors.length
      ? entry.descriptors
      : entry.descriptor
        ? [entry.descriptor]
        : [];

  return rawDescriptors.map((descriptor) => Float32Array.from(descriptor));
}

function getCachedDescriptors(faceapi: FaceApiModule, image: SearchableDriveImage) {
  const cachedDescriptor = descriptorCache.get(image.id);

  if (cachedDescriptor) {
    return cachedDescriptor;
  }

  const descriptorPromise = getFaceDescriptors(faceapi, getProxyImageUrl(image.id))
    .catch(() => []);

  descriptorCache.set(image.id, descriptorPromise);

  return descriptorPromise;
}

function getBestScore(
  faceapi: FaceApiModule,
  referenceDescriptor: FaceApiDescriptor,
  candidateDescriptors: FaceApiDescriptor[],
) {
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidateDescriptor of candidateDescriptors) {
    const score = faceapi.euclideanDistance(
      referenceDescriptor,
      candidateDescriptor,
    );

    if (score < bestScore) {
      bestScore = score;
    }
  }

  return bestScore;
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  mapper: (item: TInput, index: number) => Promise<TOutput>,
) {
  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Preview could not be created."));
    };
    reader.onerror = () => reject(new Error("Preview could not be created."));
    reader.readAsDataURL(file);
  });
}

function getDownloadName(match: SearchMatch, index: number) {
  const albumName = match.albumTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "match";

  return `${albumName}-${index + 1}.jpg`;
}

export default function FaceSearchPanel({
  images,
  descriptorEntries = [],
}: FaceSearchPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [status, setStatus] = useState(
    "",
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [searchMode, setSearchMode] = useState<SearchModeId>("balanced");
  const searchSessionRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const descriptorLookup = useMemo(
    () =>
      new Map(
        descriptorEntries.map((entry) => [
          entry.id,
          toFaceApiDescriptors(entry),
        ]),
      ),
    [descriptorEntries],
  );
  const indexedImageCount = descriptorLookup.size;
  const activeSearchMode =
    SEARCH_MODES.find((mode) => mode.id === searchMode) ?? SEARCH_MODES[1];

  const progressLabel = useMemo(() => {
    if (!isSearching) {
      return null;
    }

    return `${processedCount} / ${images.length} scanned`;
  }, [images.length, isSearching, processedCount]);
  const matchedDriveImages = useMemo(
    () => matches.map((match) => buildDriveImage(match.id)),
    [matches],
  );

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== "undefined") {
      const storedState = window.localStorage.getItem(STORAGE_KEY);

      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState) as PersistedState;
          setMatches(parsedState.matches ?? []);
          // setStatus(parsedState.status ?? "Upload one clear face photo, then run search.");
          setSearchMode(parsedState.searchMode ?? "balanced");
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    }

    loadFaceApi()
      .then(() => {
        if (isMounted) {
          setIsModelReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus(
            "Face model could not be loaded. Check the browser internet connection and refresh the page.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextState: PersistedState = {
      matches,
      status,
      searchMode,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      const reducedState: PersistedState = {
        matches,
        status,
        searchMode,
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedState));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [matches, searchMode, status]);

  useEffect(() => {
    return () => {
      searchSessionRef.current += 1;
      revokePreviewUrl(previewUrl);
    };
  }, [previewUrl]);

  function handleClearStoredData() {
    searchSessionRef.current += 1;
    revokePreviewUrl(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMatches([]);
    setStatus("");
    setProcessedCount(0);
    setIsSearching(false);
    setIsDownloadingAll(false);
    setSearchMode("balanced");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    descriptorCache.clear();
  }

  async function handleDownloadAll() {
    if (!matches.length) {
      return;
    }

    setIsDownloadingAll(true);

    try {
      for (const [index, match] of matches.entries()) {
        const link = document.createElement("a");
        link.href = `https://drive.google.com/uc?export=download&id=${match.id}`;
        link.download = getDownloadName(match, index);
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();

        await new Promise((resolve) => window.setTimeout(resolve, 220));
      }
    } finally {
      setIsDownloadingAll(false);
    }
  }

  async function handleSearch() {
    if (!selectedFile) {
      setStatus("Upload a photo first.");
      return;
    }

    const searchSessionId = searchSessionRef.current + 1;
    searchSessionRef.current = searchSessionId;
    setIsSearching(true);
    setProcessedCount(0);
    setMatches([]);
    // setStatus(
    //   indexedImageCount
    //     ? "Scanning indexed faces..."
    //     : "Scanning all photos...",
    // );

    try {
      const faceapi = await loadFaceApi();
      setIsModelReady(true);

      const uploadedImageUrl = URL.createObjectURL(selectedFile);

      try {
        const referenceDescriptor = await getFaceDescriptor(faceapi, uploadedImageUrl);

        if (searchSessionRef.current !== searchSessionId) {
          return;
        }

        if (!referenceDescriptor) {
          setStatus("No clear face was detected in the uploaded image.");
          return;
        }

        const foundMatches = await mapWithConcurrency(
          images,
          SEARCH_CONCURRENCY,
          async (image) => {
            if (searchSessionRef.current !== searchSessionId) {
              return null;
            }

            try {
              const candidateDescriptors =
                descriptorLookup.get(image.id) ??
                (await getCachedDescriptors(faceapi, image));

              if (searchSessionRef.current !== searchSessionId) {
                return null;
              }

              if (!candidateDescriptors.length) {
                return null;
              }

              const score = getBestScore(
                faceapi,
                referenceDescriptor,
                candidateDescriptors,
              );

              if (score <= activeSearchMode.threshold) {
                const nextMatch = {
                  ...image,
                  score,
                };

                if (searchSessionRef.current === searchSessionId) {
                  setMatches((currentMatches) => sortMatches([
                    ...currentMatches.filter((match) => match.id !== nextMatch.id),
                    nextMatch,
                  ]));
                }

                return nextMatch;
              }

              return null;
            } catch {
              return null;
            } finally {
              if (searchSessionRef.current === searchSessionId) {
                setProcessedCount((count) => count + 1);
              }
            }
          },
        );

        if (searchSessionRef.current !== searchSessionId) {
          return;
        }

        const sortedMatches = sortMatches(
          foundMatches.filter((match) => match !== null),
        );
        setMatches(sortedMatches);
        setStatus(
          sortedMatches.length
            ? `${sortedMatches.length} matching photos found.`
            : "No close face matches were found.",
        );
      } finally {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    } catch {
      if (searchSessionRef.current === searchSessionId) {
        setStatus(
          "Face search could not start. The face model failed to load in this browser.",
        );
      }
    } finally {
      if (searchSessionRef.current === searchSessionId) {
        setIsSearching(false);
      }
    }
  }

  return (
    <section className="rounded-xl border border-rose-800/40  bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(248,231,220,0.9))] py-6 px-3 md:p-6 shadow-[0_16px_36px_rgba(102,35,49,0.12)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-base ms:fomt-sm font-bold md:font-semibold uppercase tracking-[0.2em] md:tracking-[0.28em] text-rose-800 md:text-rose-800/80">
            Face Search
          </p>
          <h2 className="mt-3 font-serif text-lg md:text-3xl font-bold text-rose-950 hiden md:block">
            Upload photo and search ...
          </h2>
          <p className="mt-3 text-sm leading-7 text-rose-900/75 hidden md:block">
            The search scans the uploaded face against all wedding photos available and returns the closest matches.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-3xl border border-rose-900/30 bg-white/75 p-4 shadow-[0_12px_30px_rgba(102,35,49,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <label
              className="block text-sm mt-2 ms:mt-0 md:text-md font-semibold text-rose-900"
              htmlFor="face-search-upload"
            >
              Upload reference photo
            </label>
            <button
              type="button"
              onClick={handleClearStoredData}
              className="grid h-9 w-9 place-items-center rounded-full border border-rose-800/15 text-lg font-semibold text-rose-800 transition hover:bg-rose-50"
              aria-label="Clear saved search data"
            >
              x
            </button>
          </div>
          <input
            ref={fileInputRef}
            id="face-search-upload"
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setSelectedFile(nextFile);
              setMatches([]);
              // setStatus(
              //   nextFile
              //     ? "Ready to search."
              //     : "Upload one clear face photo, then run search.",
              // );

              revokePreviewUrl(previewUrl);

              if (!nextFile) {
                setPreviewUrl(null);
                return;
              }

              try {
                setPreviewUrl(await readFileAsDataUrl(nextFile));
              } catch {
                setPreviewUrl(null);
              }
            }}
            className="mt-3 block w-full rounded-2xl border border-dashed border-rose-300 bg-rose-50/70 px-2 md:px-4 py-3 text-sm text-rose-900 file:mr-4 file:rounded-full file:border-0 file:bg-rose-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-rose-50"
          />

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded face preview"
                className="h-28 w-28  rounded-xl md:rounded-2xl object-cover shadow-[0_10px_24px_rgba(102,35,49,0.12)]"
              />
            ) : (
              <div className="grid h-28 w-24 place-items-center rounded-2xl border border-dashed border-rose-300 bg-rose-50/70 text-xs font-semibold uppercase tracking-[0.2em] text-rose-800/65">
                Preview
              </div>
            )}

            <div className="flex-1">
 
              <div className="mt-3 flex flex-wrap gap-2">
                {SEARCH_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSearchMode(mode.id)}
                    disabled={isSearching}
                    className={`rounded-full border px-2 py-2 text-xs font-bold  tracking-[0.1em] transition ${
                      searchMode === mode.id
                        ? "border-rose-800 bg-red-100 -600 text-rose-800"
                        : "border-rose-800/20 text-rose-900 hover:bg-rose-50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              
              <p className="mt-2 text-xs leading-5 text-rose-900/70">
                {activeSearchMode.helpText}
              </p>
              
              {progressLabel ? (
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-rose-900">
                  {progressLabel}
                </p>
              ) : null}
              
              <p className="mt-3 text-sm leading-6 text-rose-900 font-medium">{status}</p>

                           <button
                type="button"
                onClick={handleSearch}
                disabled={!selectedFile || isSearching || !isModelReady}
                className="rounded-full bg-rose-800 px-5 py-3 mr-2 text-sm font-bold text-rose-50 transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isSearching
                  ? "Searching..."
                  : isModelReady
                    ? "Search "
                    : "Loading Model..."}
              </button>
              {matches.length ? (
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className="mt-3 rounded-full border border-rose-800/20 px-3 py-3 text-sm font-bold text-rose-900 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloadingAll ? "Downloading..." : "Download All"}
                </button>
              ) : null}
              {isSearching && matches.length ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.17em] md:tracking-[0.24em] text-white bg-rose-900 p-1.5 rounded">
                  {matches.length} matches found so far
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-800/75">
            Matches
          </p>
          <p className="text-sm text-rose-900/70">{matches.length} saved results</p>
        </div>

        {matches.length ? (
          <DriveGallery
            images={matchedDriveImages}
            title="Face Search Matches"
            getTileLabel={(image) => getAlbumNameByImageId(matches, image.id)}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-rose-300 bg-white/60 px-5 py-8 text-sm text-rose-900/70">
            Upload a face photo and run search to see matching images here.
          </div>
        )}
      </div>
      {/* <FaceIndexBuilder images={images} /> */}
    </section>
  );
}
