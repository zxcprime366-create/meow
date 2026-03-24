// subtitle-settings-modal.tsx
"use client";
import { motion } from "framer-motion";
import {
  X,
  ALargeSmall,
  Clock,
  Blend,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import { useSettingsStore } from "@/zustand/settings-store";
import { Slider } from "@/components/ui/slider";

const fontSizes = [
  { id: "small", display: "S" },
  { id: "medium", display: "M" },
  { id: "large", display: "L" },
  { id: "x-large", display: "XL" },
];

const bgOpacities = [
  { id: "off", display: "Off" },
  { id: "low", display: "Low" },
  { id: "medium", display: "Medium" },
  { id: "high", display: "High" },
];

const fontColors = [
  { id: "white", hex: "#FFFFFF", display: "White" },
  { id: "yellow", hex: "#FDE047", display: "Yellow" },
  { id: "green", hex: "#4ADE80", display: "Green" },
  { id: "cyan", hex: "#22D3EE", display: "Cyan" },
  { id: "red", hex: "#F87171", display: "Red" },
  { id: "blue", hex: "#60A5FA", display: "Blue" },
  { id: "pink", hex: "#F472B6", display: "Pink" },
  { id: "orange", hex: "#FB923C", display: "Orange" },
];

const previewSizeMap: Record<string, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  "x-large": "text-xl",
};

const previewBgMap: Record<string, string> = {
  off: "bg-transparent",
  low: "bg-black/30",
  medium: "bg-black/60",
  high: "bg-black/90",
};

const DEFAULTS = {
  "Font size": { id: "medium", display: "Medium" },
  "Font color": { id: "white", display: "White" },
  "Background opacity": { id: "medium", display: "Medium" },
  "Sync offset": { id: "0.0s", display: "0.0s" },
};

export function SubtitleSettingsModal({ onClose }: { onClose: () => void }) {
  const { values, setValue } = useSettingsStore();

  const fontSize = values["Font size"]?.id ?? "medium";
  const fontColor = values["Font color"]?.id ?? "white";
  const bgOpacity = values["Background opacity"]?.id ?? "off";
  const syncOffset = parseFloat(values["Sync offset"]?.id ?? "0.0s");

  const currentColor =
    fontColors.find((c) => c.id === fontColor)?.hex ?? "#FFFFFF";

  function setSyncOffset(val: number) {
    const rounded = Math.round(val * 10) / 10;
    const display =
      rounded > 0 ? `+${rounded.toFixed(1)}s` : `${rounded.toFixed(1)}s`;
    setValue("Sync offset", { id: display, display });
  }

  function handleReset() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setValue(key, value));
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none  "
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <div className="bg-neutral-950/80 backdrop-blur-lg rounded-xl w-full lg:max-w-md max-w-xs lg:p-6 p-3 pointer-events-auto lg:space-y-6 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium lg:text-base text-sm">
              Subtitle settings
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <RotateCcw size={13} />
                Reset
              </button>
              <button onClick={onClose}>
                <X size={18} className="text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="w-full rounded-lg bg-neutral-800 lg:h-20 h-10 flex items-center justify-center">
            <span
              className={`lg:px-3 px-2 py-1 rounded ${previewSizeMap[fontSize]} ${previewBgMap[bgOpacity]}`}
              style={{ color: currentColor }}
            >
              The quick brown fox jumps
            </span>
          </div>

          {/* Font size */}
          <div className="lg:space-y-2 space-y-1">
            <div className="flex items-center gap-2">
              <ALargeSmall size={15} className="text-neutral-400" />
              <span className="text-neutral-300 lg:text-sm text-xs">
                Font size
              </span>
            </div>
            <div className="flex lg:gap-2 gap-1">
              {fontSizes.map(({ id, display }) => (
                <button
                  key={id}
                  onClick={() => setValue("Font size", { id, display })}
                  className={`flex-1 lg:py-1.5 py-1 rounded-md text-sm transition-colors font-medium ${
                    fontSize === id
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>

          {/* Font color */}
          <div className="lg:space-y-2 space-y-1">
            <span className="text-neutral-300 lg:text-sm text-xs">
              Font color
            </span>
            <div className="flex lg:gap-2 gap-1.5 flex-wrap mt-1">
              {fontColors.map(({ id, hex, display }) => (
                <button
                  key={id}
                  onClick={() => setValue("Font color", { id, display })}
                  title={display}
                  className={`lg:size-8 size-6 rounded-sm transition-all ${
                    fontColor === id
                      ? "lg:ring-2 ring-1 ring-white ring-offset-2 ring-offset-neutral-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Background opacity */}
          <div className="lg:space-y-2 space-y-1">
            <div className="flex items-center gap-2">
              <Blend size={15} className="text-neutral-400" />
              <span className="text-neutral-300 lg:text-sm text-xs">
                Background opacity
              </span>
            </div>
            <div className="flex gap-2">
              {bgOpacities.map(({ id, display }) => (
                <button
                  key={id}
                  onClick={() =>
                    setValue("Background opacity", { id, display })
                  }
                  className={`flex-1 lg:py-1.5 py-1 font-medium rounded-md lg:text-sm text-xs transition-colors ${
                    bgOpacity === id
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>

          {/* Sync offset */}
          <div className="lg:space-y-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-neutral-400" />
                <span className="text-neutral-300lg:text-sm text-xs">
                  Sync offset
                </span>
              </div>
              <span className="text-neutral-400 lg:text-sm text-xs tabular-nums w-14 text-right">
                {syncOffset > 0
                  ? `+${syncOffset.toFixed(1)}s`
                  : `${syncOffset.toFixed(1)}s`}
              </span>
            </div>

            <div className="group flex items-center gap-3">
              <button
                onClick={() => setSyncOffset(syncOffset - 0.5)}
                className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors shrink-0"
              >
                <Minus size={14} className="text-neutral-300" />
              </button>

              <Slider
                min={-10}
                max={10}
                step={0.1}
                value={[syncOffset]}
                onValueChange={([val]) => setSyncOffset(val)}
                className="flex-1"
              />

              <button
                onClick={() => setSyncOffset(syncOffset + 0.5)}
                className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors shrink-0"
              >
                <Plus size={14} className="text-neutral-300" />
              </button>
            </div>

            <div className="flex justify-between text-xs text-neutral-600 px-11">
              <span>-10.0s</span>
              <span>0.0s</span>
              <span>+10.0s</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
