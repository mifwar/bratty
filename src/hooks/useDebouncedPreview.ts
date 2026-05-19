import { useEffect, useRef, useState } from "react";
import { renderCanvasPreview } from "../lib/renderCanvas";

interface PreviewState {
  text: string;
  dataUrl: string | null;
}

export function useDebouncedPreview(
  renderText: string,
  liveText: string,
): string | null {
  const [preview, setPreview] = useState<PreviewState>({
    text: "",
    dataUrl: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!renderText.trim()) return;

    timeoutRef.current = setTimeout(() => {
      setPreview({
        text: renderText,
        dataUrl: renderCanvasPreview(renderText),
      });
      timeoutRef.current = null;
    }, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [renderText]);

  if (!liveText.trim()) return null;
  return preview.dataUrl;
}
