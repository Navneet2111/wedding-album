export type DriveImage = {
  id: string;
  thumbSources: string[];
  fullSources: string[];
};

function extractFileIds(html: string) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/g,
    /"id":"([a-zA-Z0-9_-]{10,})"/g,
    /[?&]id=([a-zA-Z0-9_-]{10,})/g,
  ];

  const ids = new Set<string>();

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      if (match[1]) {
        ids.add(match[1]);
      }
    }
  }

  return [...ids];
}

export async function getDriveImages(folderId: string): Promise<DriveImage[]> {
  try {
    const response = await fetch(
      `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const ids = extractFileIds(html);

    return ids.map((id) => ({
      id,
      thumbSources: [
        `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
        `https://lh3.googleusercontent.com/d/${id}=w1200`,
        `https://drive.google.com/uc?export=view&id=${id}`,
      ],
      fullSources: [
        `https://drive.google.com/thumbnail?id=${id}&sz=w2400`,
        `https://lh3.googleusercontent.com/d/${id}=w2400`,
        `https://drive.google.com/uc?export=view&id=${id}`,
      ],
    }));
  } catch {
    return [];
  }
}

export async function getDriveImagesFromFolders(folderIds: string[]) {
  const imageGroups = await Promise.all(folderIds.map((folderId) => getDriveImages(folderId)));
  const merged = new Map<string, DriveImage>();

  for (const group of imageGroups) {
    for (const image of group) {
      if (!merged.has(image.id)) {
        merged.set(image.id, image);
      }
    }
  }

  return [...merged.values()];
}
