import React from "react";
import { Link } from "react-router-dom";

/**
 * SearchResults Component
 * @param {Object[]} results - Array of matched document objects.
 * @param {Function} onSelect - Callback when a result is selected.
 */
export default function SearchResults({ results, onSelect }) {
  if (!results || results.length === 0) {
    return (
      <div className="p-3 text-gray-500 text-sm">
        No matching documents found.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {results.map((doc, idx) => (
        <li
          key={idx}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Link
            to={`/${encodeURIComponent(doc.filePath.replace(/^\/docs\//, ""))}`}
            className="block p-3"
            onClick={onSelect}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {doc.title || doc.filePath.split("/").pop()}
            </div>
            {doc.description && (
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {doc.description}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
