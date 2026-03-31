import FaceSearchPanel from "@/components/face-search-panel";
import {
  getFaceSearchDescriptorEntries,
  getFaceSearchImages,
} from "@/lib/face-search";

export default async function FaceSearchPanelServer() {
  const [images, descriptorEntries] = await Promise.all([
    getFaceSearchImages(),
    getFaceSearchDescriptorEntries(),
  ]);

  return (
    <FaceSearchPanel
      images={images}
      descriptorEntries={descriptorEntries}
    />
  );
}
