export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/niches/:path*",
    "/opportunities/:path*",
    "/stats/:path*",
    "/calculator/:path*",
    "/settings/:path*",
    "/ai/:path*",
    "/share/:path*",
  ],
};
