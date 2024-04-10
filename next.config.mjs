/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  /*
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, PUT, PATCH, GET, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "origin, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  */
};

export default nextConfig;
