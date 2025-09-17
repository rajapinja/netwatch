/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}", // very important for Tailwind to scan DocViewer
];
export const theme = {
  extend: {},
};
export const plugins = [require('@tailwindcss/typography')];
