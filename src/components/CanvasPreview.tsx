interface CanvasPreviewProps {
  dataUrl: string | null;
  onEmptyClick?: () => void;
}

export function CanvasPreview({ dataUrl, onEmptyClick }: CanvasPreviewProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Preview"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: "2px",
            border: "1px solid #e0e0e0",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          draggable={false}
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={onEmptyClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEmptyClick?.();
            }
          }}
          style={{
            width: "100%",
            maxWidth: "500px",
            aspectRatio: "1 / 1",
            background: "#eaeaea",
            borderRadius: "2px",
            border: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "text",
          }}
        >
          type something
        </div>
      )}
    </div>
  );
}
