import { useState, useEffect, useCallback, useRef } from "react";
import { normalizeUrl, getTextFromUrl, setTextInUrl } from "../lib/url";

const DEBOUNCE_MS = 400;

export function useTextQueryParam(): [string, (text: string) => void] {
  const [text, setTextState] = useState(() => {
    normalizeUrl();
    return getTextFromUrl();
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setText = useCallback((newText: string) => {
    setTextState(newText);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setTextInUrl(newText);
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return [text, setText];
}
