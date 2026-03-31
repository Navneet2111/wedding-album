export type SearchableDriveImage = {
  id: string;
  albumSlug: string;
  albumTitle: string;
  imageLabel: string;
};

export type FaceSearchDescriptorEntry = SearchableDriveImage & {
  descriptor?: number[];
  descriptors?: number[][];
};

export type FaceSearchDescriptorIndexFile = {
  version: 1;
  generatedAt: string;
  albumSlug: string;
  batchNumber: number;
  batchSize: number;
  totalImagesInAlbum: number;
  indexedCount: number;
  skippedCount: number;
  items: FaceSearchDescriptorEntry[];
};
