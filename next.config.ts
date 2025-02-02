/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // Agrega Cloudinary como dominio permitido
  },
};

module.exports = nextConfig;
