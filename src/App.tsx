import { useCallback, useDeferredValue, useEffect, useRef } from "react";
import { CanvasPreview } from "./components/CanvasPreview";
import { FloatingInput } from "./components/FloatingInput";
import { ToastMessage } from "./components/ToastMessage";
import { Toolbar } from "./components/Toolbar";
import { useDebouncedPreview } from "./hooks/useDebouncedPreview";
import { useTextQueryParam } from "./hooks/useTextQueryParam";
import { useToastMessage } from "./hooks/useToastMessage";
import { useVisualViewportHeight } from "./hooks/useVisualViewportHeight";
import { copyTextToClipboard } from "./lib/clipboard";
import {
  copyImageToClipboard,
  downloadPNG,
  renderCanvasBlob,
} from "./lib/renderCanvas";
import { buildShareUrl } from "./lib/url";

function App() {
  const [text, setText] = useTextQueryParam();
  const deferredText = useDeferredValue(text);
  const dataUrl = useDebouncedPreview(deferredText, text);
  const [toast, showToast] = useToastMessage();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const viewportHeight = useVisualViewportHeight();

  const renderCurrentBlob = useCallback(async () => {
    const blob = await renderCanvasBlob(text);
    if (!blob) {
      showToast("Type something first");
    }
    return blob;
  }, [showToast, text]);

  const handleCopy = useCallback(async () => {
    const blob = await renderCurrentBlob();
    if (!blob) return;

    if (!window.isSecureContext) {
      // Clipboard API requires HTTPS, so save instead.
      downloadPNG(blob, "brat-text.png");
      showToast("Saved (copy needs HTTPS)");
      return;
    }

    const ok = await copyImageToClipboard(blob);
    if (ok) {
      showToast("Copied to clipboard");
    } else {
      showToast("Copy failed - try download");
    }
  }, [renderCurrentBlob, showToast]);

  const handleDownload = useCallback(async () => {
    const blob = await renderCurrentBlob();
    if (!blob) return;

    const safeText = text
      .trim()
      .slice(0, 30)
      .replace(/[^a-zA-Z0-9]/g, "-");

    downloadPNG(blob, `brat-${safeText || "text"}.png`);
    showToast("Downloaded");
  }, [renderCurrentBlob, showToast, text]);

  const handleShareLink = useCallback(async () => {
    const url = buildShareUrl(text);
    const ok = await copyTextToClipboard(url);
    showToast(ok ? "Link copied" : "Could not copy link");
  }, [showToast, text]);

  const handleReset = useCallback(() => {
    setText("");
  }, [setText]);

  const handleNativeShare = useCallback(async () => {
    const blob = await renderCurrentBlob();
    if (!blob) return;

    const file = new File([blob], "brat-text.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "brat text",
      });
    } catch (err) {
      if (!(err instanceof Error && err.name === "AbortError")) {
        showToast("Share failed");
      }
    }
  }, [renderCurrentBlob, showToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta) return;

      const target = e.target as HTMLElement;
      const isTextInput = target.tagName === "TEXTAREA" || target.tagName === "INPUT";
      const key = e.key.toLowerCase();

      if (isTextInput && key !== "s" && key !== "c") {
        return;
      }

      if (key === "s") {
        e.preventDefault();
        handleDownload();
      } else if (key === "c" && !isTextInput) {
        e.preventDefault();
        handleCopy();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCopy, handleDownload]);

  return (
    <div
      style={{
        width: "100%",
        height: `${viewportHeight}px`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <CanvasPreview
          dataUrl={dataUrl}
          onEmptyClick={() => inputRef.current?.focus()}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px 16px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        <Toolbar
          onCopy={handleCopy}
          onDownload={handleDownload}
          onShareLink={handleShareLink}
          onReset={handleReset}
          onNativeShare={
            typeof navigator !== "undefined" &&
            "share" in navigator &&
            window.isSecureContext
              ? handleNativeShare
              : undefined
          }
          hasImage={!!text.trim()}
        />
        <FloatingInput inputRef={inputRef} value={text} onChange={setText} />
      </div>

      {toast && <ToastMessage message={toast} />}
    </div>
  );
}

export default App;
