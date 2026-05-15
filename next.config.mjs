function supabaseImageHosts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const hostname = new URL(url).hostname;
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  images: {
    remotePatterns: supabaseImageHosts(),
  },
};

export default nextConfig;
