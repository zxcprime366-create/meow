// hooks/useSandboxDetection.js
import { useState, useEffect } from "react";
export function useSandboxDetection() {
  const [isSandboxed, setIsSandboxed] = useState(false);

  useEffect(() => {
    const checkSandbox = () => {
      if (window.self === window.top) return false;

      try {
        // window.top is null in some sandboxed contexts — treat as sandboxed
        if (!window.top) return true;
        void window.top.location.href;
        return false;
      } catch (e) {
        return true;
      }
    };

    setIsSandboxed(checkSandbox());
  }, []);

  return isSandboxed;
}
