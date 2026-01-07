import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTheme } from "../store/slices/themeSlice";
import type { ThemeMode } from "../store/slices/themeSlice";

const ThemeSwitcher = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.theme.mode);

  const themes: { mode: ThemeMode; label: string; color: string }[] = [
    { mode: "classy", label: "Classy", color: "#4a5d3e" },
    { mode: "modern", label: "Modern", color: "#3b82f6" },
    { mode: "vibrant", label: "Vibrant", color: "#ec4899" },
  ];

  return (
    <div className="relative group">
      <button className="p-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-300 flex items-center space-x-2">
        <FontAwesomeIcon icon={faPalette} className="text-xl" />
        <span className="text-sm font-semibold hidden md:inline">Theme</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="p-3 space-y-2">
          {themes.map((theme) => (
            <button
              key={theme.mode}
              onClick={() => dispatch(setTheme(theme.mode))}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                currentTheme === theme.mode
                  ? "bg-opacity-20 shadow-md"
                  : "hover:bg-gray-100"
              }`}
              style={{
                backgroundColor:
                  currentTheme === theme.mode ? `${theme.color}20` : undefined,
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="font-semibold text-gray-700">
                  {theme.label}
                </span>
              </div>
              {currentTheme === theme.mode && (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-lg"
                  style={{ color: theme.color }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
