import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { albumItems, getAlbumItem } from "@/app/dashboard/album/album-data";
import DriveGallery from "@/components/drive-gallery";
import { getDriveImagesFromFolders } from "@/lib/google-drive";

type AlbumDetailPageProps = PageProps<"/dashboard/album/[slug]">;

export async function generateStaticParams() {
  return albumItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(
  props: AlbumDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = getAlbumItem(slug);

  if (!item) {
    return {
      title: "Album",
    };
  }

  return {
    title: item.title,
    description: item.description,
  };
}

export default async function AlbumDetailPage(props: AlbumDetailPageProps) {
  const { slug } = await props.params;
  const item = getAlbumItem(slug);

  if (!item) {
    notFound();
  }

  const showPreviewGrid = !item.driveFolderId;
  const driveFolderIds =
    item.driveFolderIds ??
    (item.driveFolderId ? [item.driveFolderId] : []);
  const driveImages = driveFolderIds.length
    ? await getDriveImagesFromFolders(driveFolderIds)
    : [];

  return (
    <section className="space-y-6 animate-[popIn_0.6s_ease-out]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="hidden lg:block  relative min-h-[320px] overflow-hidden rounded-xl border border-rose-900/10 bg-white/60 shadow-[0_18px_45px_rgba(102,35,49,0.14)]">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(55,18,28,0.04),rgba(55,18,28,0.58))]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-100/90">
              Wedding Album
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold">
              {item.shortLabel}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-rose-50/90">
              {item.description}
            </p>
          </div>
        </div>

        <div className="hidden lg:block rounded-xl border border-rose-900/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,231,220,0.82))] p-6 shadow-[0_18px_45px_rgba(102,35,49,0.12)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-800/75">
            Chapter Details
          </p>
          <h3 className="mt-4 font-serif text-3xl font-bold text-rose-950">
            {item.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-rose-900/75">
            {item.note}
          </p>

          <div className="mt-6 grid gap-3">
            {item.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-rose-900/10 bg-white/70 px-4 py-3 text-sm font-medium text-rose-900"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPreviewGrid ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {item.highlights.map((highlight, index) => (
            <article
              key={highlight}
              className="overflow-hidden rounded-md border border-rose-900/10 bg-white/75 shadow-[0_14px_34px_rgba(102,35,49,0.1)]"
            >
              <div className="relative h-56 md:60">
                <Image
                  src={item.image}
                  alt={`${item.title} preview ${index + 1}`}
                  fill
                  className="object-cover object-center"
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {driveFolderIds.length ? (
        <DriveGallery images={driveImages} title={item.title} />
      ) : null}
    </section>
  );
}
