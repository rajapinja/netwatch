// SwaggerDocs.jsx
import { BookOpen } from "lucide-react";

export default function SwaggerDocs() {
  return (
    <div className="w-full max-w-md mx-auto border border-gray-100 bg-white dark:bg-gray-600 rounded-2xl shadow-lg p-6 flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        API Documentation
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Explore backend REST APIs via Swagger UI.
      </p>
      <button
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center space-x-2"
        onClick={() =>
          window.open("http://localhost:9394/swagger-ui/index.html#", "_blank")
        }
      >
        <BookOpen className="w-5 h-5" />
        <span>Open Swagger Docs</span>
      </button>
    </div>
  );
}
