import { useEffect, useState } from "react";

const tips = [
  "Tip: Switch server if loading gets stuck.",
  "Tip: Check your internet connection.",
  "Tip: Use ↑ ↓ to change servers.",
  "Tip: Press Enter to select.",
  "Tip: Adjust brightness in Settings",
  "Free streaming at zxcstream.icu",
  "Tip: Press Space or K to play/pause.",
  "Tip: Press F for fullscreen.",
  "Tip: Press M to mute.",
  "Tip: ← → skip 15s.",
  "Tip: Try dual subtitles.",
  "Tip: Use sleep timer 😴",
  "Tip: Change playback speed.",
];
export default function DynamicTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(() =>
    Math.floor(Math.random() * tips.length),
  );
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade out
      setTimeout(() => {
        setCurrentTipIndex(Math.floor(Math.random() * tips.length));
        setFade(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute lg:bottom-4 bottom-2 max-[340px]:bottom-0 left-1/2 -translate-x-1/2 z-10 text-center max-[340px]:text-[0.5rem] text-sm  md:text-base lg:text-lg transition-opacity duration-500 w-full p-4 max-[340px]:p-0.5 ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    >
      {tips[currentTipIndex]}
    </div>
  );
}
