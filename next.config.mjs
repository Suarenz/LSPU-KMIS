/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 1000,
  images: {
     unoptimized: false,
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'mydcfacggxluyljslcbp.supabase.co',
         port: '',
         pathname: '/storage/v1/object/public/**',
       },
       {
         protocol: 'http',
         hostname: 'localhost',
         port: '300',
         pathname: '/**',
       }
     ],
     // Set reasonable defaults for image optimization
     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
     dangerouslyAllowSVG: false,
     contentSecurityPolicy: "script-src 'self' blob:; object-src 'none';",
   },
   // Enable compression for faster loading
   compress: true,
   // Enable experimental features that improve performance
   experimental: {
     optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
   },
}

export default nextConfig
