/** Download and decode photos without adding them to the document. */
export function createGalleryImageLoader(cacheSize = 4) {
  const cache = new Map<string, Promise<HTMLImageElement>>();

  return function loadImage(sources: string[]): Promise<HTMLImageElement> {
    const key = JSON.stringify(sources);
    const cached = cache.get(key);
    if (cached) return cached;

    const request = (async () => {
      for (const src of sources) {
        try {
          const image = new Image();
          image.referrerPolicy = "no-referrer";
          image.decoding = "async";
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Photo failed to load."));
            image.src = src;
          });
          // A downloaded photo may still need decoding before it can be painted.
          await image.decode();
          image.onload = null;
          image.onerror = null;
          return image;
        } catch {
          // Try the next Drive URL, then the thumbnail as a final fallback.
        }
      }
      throw new Error("Photo could not be loaded. Please try another photo.");
    })();

    cache.set(key, request);
    // Retain only a few full-size photos rather than the entire album.
    if (cache.size > cacheSize) cache.delete(cache.keys().next().value!);
    void request.catch(() => {
      if (cache.get(key) === request) cache.delete(key);
    });
    return request;
  };
}
