/**
 * postcss.config.js
 * Fixed for Tailwind CSS v4+ in Next.js
 * Uses @tailwindcss/postcss as the PostCSS plugin.
 */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
