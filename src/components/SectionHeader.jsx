// SectionHeader.jsx
import React from "react";

export default function SectionHeader({
  title,
  toggle,
  isOpen,
  collapseLabel = "▲ Collapse",
  expandLabel = "▼ Expand",
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-between cursor-pointer 
                  bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-lg 
                  ${className}`}
      onClick={toggle}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {isOpen ? collapseLabel : expandLabel}
      </span>
    </div>
  );
}
