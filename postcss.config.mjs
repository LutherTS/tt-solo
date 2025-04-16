/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

/* Notes
Actually indispensable for Tailwind v4 to work with Next.js 15.
*/
