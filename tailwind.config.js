/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Escanea todos los archivos en la carpeta `app`
    './components/**/*.{js,ts,jsx,tsx}', // Escanea los componentes
    './pages/**/*.{js,ts,jsx,tsx}', // Si tienes una carpeta `pages`
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
