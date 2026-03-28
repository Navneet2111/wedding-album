import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Deprecated route. Client-side Firebase auth is used instead." },
    { status: 404 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Deprecated route. Client-side Firebase auth is used instead." },
    { status: 404 },
  );
}
