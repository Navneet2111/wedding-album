"use client";

import DownloadProgressDialog from "@/components/download-progress-dialog";
import type { usePhotoDownload } from "@/hooks/use-photo-download";

export default function PhotoDownloadFeedback({ download, label }: { download: ReturnType<typeof usePhotoDownload>; label: string }) {
  return <>
    {download.message && !download.dialogOpen && <p role="status" className="rounded-xl border border-rose-900/10 bg-white/60 p-3 text-sm text-rose-900">{download.message}</p>}
    {download.individualDownloads.length > 0 && <details className="rounded-xl border border-rose-900/10 bg-white/60 p-3 text-sm text-rose-900"><summary className="cursor-pointer font-semibold">Missing a photo? Download individually</summary><p className="mt-2 text-xs leading-6 text-rose-900/70">Use these links if your browser blocked automatic downloads.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{download.individualDownloads.map(photo => <a key={photo.id} href={photo.url} download={photo.name} className="truncate rounded-lg border border-rose-900/10 bg-white px-3 py-2 underline underline-offset-4">{photo.name}</a>)}</div></details>}
    <DownloadProgressDialog open={download.dialogOpen} preparing={download.downloading} completed={download.progress.completed} total={download.progress.total} message={download.message} outcome={download.outcome} onCancel={download.cancel} onDismiss={download.dismiss} collectionLabel={label} />
  </>;
}
