import { NextResponse } from "next/server";

const allowedOrigins = [
  process.env.ORIGIN_URL,
  "https://localhost:3000",
  "https://127.0.0.1:3000",
];

const corsOptions = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(request) {
  //CORS Check the origin from the request
  //-------------------------------------------------------
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";


  //ja dodao ove pathname zato sto next.js middlexare javlja neku connection error
  //pa da minimiziram broj ponavljnaja greske samo na login i register
  if (
    isPreflight &&
    (request.nextUrl.pathname.startsWith("/api/login") ||
      request.nextUrl.pathname.startsWith("/api/register"))
  ) {
    const preflightHeaders = {
      ...(isAllowedOrigin && {
        "Access-Control-Allow-Origin": origin,
        ...corsOptions,
      }),
    };

    return NextResponse.json({}, { status: 200, headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!|_next/static|_next/image|favicon.ico).*)",
  ],
};
