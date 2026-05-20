import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { CanvasPreview } from "./components/CanvasPreview";
import { FloatingInput } from "./components/FloatingInput";
import { StyleControls } from "./components/StyleControls";
import { ToastMessage } from "./components/ToastMessage";
import { Toolbar } from "./components/Toolbar";
import { useDebouncedPreview } from "./hooks/useDebouncedPreview";
import { useTextQueryParam } from "./hooks/useTextQueryParam";
import { useToastMessage } from "./hooks/useToastMessage";
import { useVisualViewportHeight } from "./hooks/useVisualViewportHeight";
import { trackEvent } from "./lib/analytics";
import { copyTextToClipboard } from "./lib/clipboard";
import {
  copyImageToClipboard,
  downloadPNG,
  renderCanvasBlob,
} from "./lib/renderCanvas";
import {
  buildShareUrl,
  getRenderOptionsFromUrl,
  setRenderOptionsInUrl,
} from "./lib/url";

function App() {
  const [text, setText] = useTextQueryParam();
  const [renderOptions, setRenderOptions] = useState(getRenderOptionsFromUrl);
  const deferredText = useDeferredValue(text);
  const dataUrl = useDebouncedPreview(deferredText, text, renderOptions);
  const [toast, showToast] = useToastMessage();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const renderOptionsUrlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const viewportHeight = useVisualViewportHeight();

  const renderCurrentBlob = useCallback(async () => {
    const blob = await renderCanvasBlob(text, undefined, renderOptions);
    if (!blob) {
      showToast("Type something first");
    }
    return blob;
  }, [renderOptions, showToast, text]);

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
    trackEvent("download_image", {
      padding: renderOptions.padding,
      text_length: text.trim().length,
    });
    showToast("Downloaded");
  }, [renderCurrentBlob, renderOptions.padding, showToast, text]);

  const handleShareLink = useCallback(async () => {
    const url = buildShareUrl(text, renderOptions);
    const ok = await copyTextToClipboard(url);
    showToast(ok ? "Link copied" : "Could not copy link");
  }, [renderOptions, showToast, text]);

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
    if (renderOptionsUrlDebounceRef.current) {
      clearTimeout(renderOptionsUrlDebounceRef.current);
    }

    renderOptionsUrlDebounceRef.current = setTimeout(() => {
      setRenderOptionsInUrl(renderOptions);
      renderOptionsUrlDebounceRef.current = null;
    }, 150);

    return () => {
      if (renderOptionsUrlDebounceRef.current) {
        clearTimeout(renderOptionsUrlDebounceRef.current);
        renderOptionsUrlDebounceRef.current = null;
      }
    };
  }, [renderOptions]);

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
        <StyleControls value={renderOptions} onChange={setRenderOptions} />
        <FloatingInput inputRef={inputRef} value={text} onChange={setText} />
        <a
          href="http://mifwar.com/"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#999",
            fontSize: "11px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          made by mifwar
        </a>
      </div>

      {toast && <ToastMessage message={toast} />}
    </div>
  );
}

export default App;
