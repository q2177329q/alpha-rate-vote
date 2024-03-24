/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js"],
  },
  images: {
    remotePatterns: [
      {
        hostname: "*",
        protocol: "http",
      },
      {
        hostname: "*",
        protocol: "https",
      },
    ],
  },
  // webpack: (config) => {
  //   config.resolve.alias.canvas = false;
  //   return config;
  // },
  webpack: (config, { dev, isServer, webpack, nextRuntime }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: "nextjs-node-loader",
          options: {
            // flags: os.constants.dlopen.RTLD_NOW,
            outputPath: config.output.path
          }
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
