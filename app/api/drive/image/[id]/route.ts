import type { NextRequest } from "next/server";

const DRIVE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,}$/;

type DriveImageRouteContext = RouteContext<"/api/drive/image/[id]">;

function getDriveImageUrl(id: string, size: number) {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

export async function GET(
  request: NextRequest,
  context: DriveImageRouteContext,
) {
  const { id } = await context.params;

  if (!DRIVE_ID_PATTERN.test(id)) {
    return new Response("Invalid image id", { status: 400 });
  }

  const requestedSize = Number(request.nextUrl.searchParams.get("size") ?? "1200");
  const size = Number.isFinite(requestedSize)
    ? Math.min(Math.max(Math.round(requestedSize), 256), 2000)
    : 1200;

  const response = await fetch(getDriveImageUrl(id, size), {
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response("Drive image could not be loaded", { status: 502 });
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
