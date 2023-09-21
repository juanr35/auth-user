module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: `/:path*`,
      },
      {
        source: "/profile",
        destination: `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}`,
      },
      {
        source: "/profile/:path*",
        destination: `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/:path*`,
      },
      {
        source: "/express",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL_RAW}`,
      },
      {
        source: "/express/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL_RAW}/:path*`,
      },
    ];
  }
}