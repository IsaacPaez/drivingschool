export function middleware() {
  // Middleware vacío, no realiza ninguna acción
  return;
}

export const config = {
  matcher: ["/myschedule/:path*", "/(api|trpc)(.*)"],
};
