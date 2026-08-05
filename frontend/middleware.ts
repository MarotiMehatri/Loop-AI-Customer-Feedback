import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (decodeURIComponent(request.nextUrl.pathname) === "/protected/viewer/ask loop ai") {
    return NextResponse.redirect(new URL("/protected/viewer/ask-loop", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/protected/viewer/:path*"] };
