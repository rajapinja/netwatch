import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { SunIcon, MoonIcon, SearchIcon } from "@heroicons/react/solid";
 // Choose any icon from lucide.dev
 import { Network } from "lucide-react";
import HeaderWithCaption from "./HeaderWithCaption";

export default function Topbar({ title = "📡 Live Packet Monitor", onSearch }) {
  const { theme, toggle } = useContext(ThemeContext);

  return (
    <header className="w-full py-4 px-6 bg-gradient-to-r from-blue-900 via-pink-900 to-gray-900 dark:from-gray-700 dark:via-gray-900 dark:to-black shadow-md rounded">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">        
        {/* Left: Logo + Title */}
        {/* <HeaderWithCaption 
          title="Live Packet Monitor" 
          version="v1.0.0"
          caption="Lets applications capture raw packets from the network interface."
          //captionStyle="subtle"
          captionStyle="highlight"
           //captionStyle="muted"
        /> */}
       <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-200 via-pink-200 to-yellow-200 flex items-center justify-center text-pink-800 font-bold shadow">
          <Network className="w-6 h-6" />
        </div>

          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-400">
              {title} <sup>v1.0.0</sup>
            </h1>
            <span className="text-xs italic font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Lets applications capture raw packets from the network interface.
            </span>
          </div>
        </div>

       {/* Middle: Search Bar */}
        <div className="flex items-center md:w-1/4 relative">
          <SearchIcon className="w-6 h-6 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />          
          <input
            type="text"
            placeholder="Search Packets..."
            className="w-full p-2 pl-10 rounded-lg 
                    text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-400
                    bg-white dark:bg-gray-500
                    focus:outline-none focus:ring-2 focus:ring-pink-500"
            onChange={(e) => onSearch?.(e.target.value)}                
            
          />
        </div>

        {/* Right: Theme Toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-700 rounded-lg text-white hover:scale-105 transition"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <>
              <SunIcon className="w-5 h-5" /> Light
            </>
          ) : (
            <>
              <MoonIcon className="w-5 h-5" /> Dark
            </>
          )}
        </button>
      </div>
    </header>
  );
}
