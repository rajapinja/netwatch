import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

export default function HeaderWithCaption({ 
  title, 
  version = "v1.0.0", 
  caption, 
  captionStyle // optional → overrides default
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const listener = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 🔹 Pick style: user > auto-theme
  const effectiveStyle = captionStyle || (isDarkMode ? "highlight" : "subtle");

  return (
    <div className="flex flex-col gap-1">
      {/* Title Row */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-200 via-pink-200 to-yellow-200 flex items-center justify-center text-pink-800 font-bold shadow">
          <Network className="w-6 h-6" />
        </div>
        <h1 className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-400">
          {title} <sup className="text-xs text-gray-500">{version}</sup>
        </h1>
      </div>

      {/* Caption Row with Animation */}
      {caption && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={
            effectiveStyle === "highlight"
              ? "text-sm italic font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
              : effectiveStyle === "muted"
              ? "text-xs text-gray-400 dark:text-gray-500"
              : "text-sm font-light text-gray-500 dark:text-gray-400 italic"
          }
        >
          {caption}
        </motion.span>
      )}
    </div>
  );
}

// ✅ Usage Examples

// <HeaderWithCaption 
//   title="Packet Monitor" 
//   version="v1.0.0"
//   caption="Lets applications capture raw packets from the network interface."
//   captionStyle="subtle"
// />

// <HeaderWithCaption 
//   title="Packet Monitor" 
//   version="v1.0.0"
//   caption="Lets applications capture raw packets from the network interface."
//   captionStyle="highlight"
// />

// <HeaderWithCaption 
//   title="Packet Monitor" 
//   version="v1.0.0"
//   caption="Lets applications capture raw packets from the network interface."
//   captionStyle="muted"
// />