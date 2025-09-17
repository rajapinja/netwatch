function SwaggerIcon({ size = 32 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className="text-green-600"
    >
      <circle cx="16" cy="16" r="16" fill="#85EA2D" />
      <path
        d="M16 6a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 4v2h2v-2h-2zm0 12v2h2v-2h-2zm-4.24-8.24l1.41 1.41A3.98 3.98 0 0 0 12 16a3.98 3.98 0 0 0 .17 1.83l-1.41 1.41A5.978 5.978 0 0 1 10 16c0-1.63.66-3.11 1.76-4.24zM20.24 11.76A5.978 5.978 0 0 1 22 16c0 1.63-.66 3.11-1.76 4.24l-1.41-1.41A3.98 3.98 0 0 0 20 16a3.98 3.98 0 0 0-.17-1.83l1.41-1.41z"
        fill="#000"
      />
    </svg>
  );
}

export default SwaggerIcon;