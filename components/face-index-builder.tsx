"use client";

import { useMemo, useState } from "react";
import type {
  FaceSearchDescriptorIndexFile,
  SearchableDriveImage,
} from "@/lib/face-search-types";

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
};

const FACE_API_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const FACE_API_MODELS_URL =
  "https://justadudewhohacks.github.io/face-api.js/models";
const INDEX_BATCH_SIZE = 100;
const INDEX_CONCURRENCY = 2;
const MAX_DESCRIPTORS_PER_IMAGE = 5;

let faceApiLoader: Promise<FaceApiModule> | null = null;

function getProxyImageUrl(id: string, size = 1200) {
  return `/api/drive/image/${id}?size=${size}`;
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

async function getFaceDescriptors(faceapi: FaceApiModule, imageSrc: string) {
  const image = await loadImageElement(imageSrc);
  const results = await faceapi
    .detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return results
    .map((result) => result.descriptor)
    .slice(0, MAX_DESCRIPTORS_PER_IMAGE);
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

type FaceIndexBuilderProps = {
  images: SearchableDriveImage[];
};

export default function FaceIndexBuilder({ images }: FaceIndexBuilderProps) {
  const [albumSlug, setAlbumSlug] = useState("engagement");
  const [batchNumber, setBatchNumber] = useState(1);
  const [status, setStatus] = useState(
    "Build one batch at a time and download the JSON file.",
  );
  const [processedCount, setProcessedCount] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

  const albumOptions = useMemo(() => {
    const uniqueAlbums = new Map<string, string>();

    for (const image of images) {
      if (!uniqueAlbums.has(image.albumSlug)) {
        uniqueAlbums.set(image.albumSlug, image.albumTitle);
      }
    }

    return [...uniqueAlbums.entries()].map(([slug, title]) => ({ slug, title }));
  }, [images]);

  const imagesForAlbum = useMemo(
    () => images.filter((image) => image.albumSlug === albumSlug),
    [albumSlug, images],
  );
  const totalBatches = Math.max(
    1,
    Math.ceil(imagesForAlbum.length / INDEX_BATCH_SIZE),
  );
  const boundedBatchNumber = Math.min(batchNumber, totalBatches);
  const batchStartIndex = (boundedBatchNumber - 1) * INDEX_BATCH_SIZE;
  const batchImages = imagesForAlbum.slice(
    batchStartIndex,
    batchStartIndex + INDEX_BATCH_SIZE,
  );

  async function handleBuildBatch() {
    setIsBuilding(true);
    setProcessedCount(0);
    setStatus("Preparing face-index batch...");

    try {
      const faceapi = await loadFaceApi();
      const results = await mapWithConcurrency(
        batchImages,
        INDEX_CONCURRENCY,
        async (image) => {
          try {
            const descriptors = await getFaceDescriptors(
              faceapi,
              getProxyImageUrl(image.id),
            );

            if (!descriptors.length) {
              return null;
            }

            return {
              ...image,
              descriptors: descriptors.map((descriptor) => Array.from(descriptor)),
            };
          } catch {
            return null;
          } finally {
            setProcessedCount((count) => count + 1);
          }
        },
      );

      const items = results.filter((item) => item !== null);
      const skippedCount = batchImages.length - items.length;
      const payload: FaceSearchDescriptorIndexFile = {
        version: 1,
        generatedAt: new Date().toISOString(),
        albumSlug,
        batchNumber: boundedBatchNumber,
        batchSize: INDEX_BATCH_SIZE,
        totalImagesInAlbum: imagesForAlbum.length,
        indexedCount: items.length,
        skippedCount,
        items,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `face-index-${albumSlug}-batch-${boundedBatchNumber}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      setStatus(
        `Downloaded batch ${boundedBatchNumber} for ${albumSlug}. Indexed ${items.length} images, skipped ${skippedCount}.`,
      );
    } catch {
      setStatus("Face-index batch could not be built in this browser.");
    } finally {
      setIsBuilding(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-rose-900/15 bg-white/70 p-4 shadow-[0_12px_30px_rgba(102,35,49,0.08)]">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-800/75">
            Face Index Builder
          </p>
          <p className="mt-2 text-sm leading-6 text-rose-900/75">
            Generates one JSON batch at a time with low CPU load. Each photo can
            now store multiple detected faces for better group-photo matching.
            Move the downloaded files into the repo `data` folder before deploy.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-rose-900">
            Album
            <select
              value={albumSlug}
              onChange={(event) => {
                setAlbumSlug(event.target.value);
                setBatchNumber(1);
                setProcessedCount(0);
              }}
              className="mt-2 w-full rounded-2xl border border-rose-300 bg-white px-3 py-2 text-sm text-rose-900"
            >
              {albumOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-rose-900">
            Batch
            <input
              type="number"
              min={1}
              max={totalBatches}
              value={boundedBatchNumber}
              onChange={(event) => {
                const nextValue = Number(event.target.value || "1");
                setBatchNumber(
                  Math.min(Math.max(Math.round(nextValue), 1), totalBatches),
                );
                setProcessedCount(0);
              }}
              className="mt-2 w-full rounded-2xl border border-rose-300 bg-white px-3 py-2 text-sm text-rose-900"
            />
          </label>

          <div className="text-sm text-rose-900">
            <p className="font-medium">Batch details</p>
            <p className="mt-2">{batchImages.length} photos in this batch</p>
            <p>{imagesForAlbum.length} photos in this album</p>
            <p>{totalBatches} total batches</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleBuildBatch}
            disabled={!batchImages.length || isBuilding}
            className="rounded-full border border-rose-800/20 px-5 py-3 text-sm font-bold text-rose-900 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBuilding ? "Building Batch..." : "Build JSON Batch"}
          </button>
          <p className="text-sm leading-6 text-rose-900/75">
            {processedCount ? `${processedCount} / ${batchImages.length} processed` : status}
          </p>
        </div>
      </div>
    </section>
  );
}
