export function middleware() {
  // Middleware vacío, no realiza ninguna acción
  return;
}

export const config = {
  matcher: ["/teachers/:path*", "/(api|trpc)(.*)"],
};
