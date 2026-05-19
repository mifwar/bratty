interface ToolbarProps {
  onCopy: () => void;
  onDownload: () => void;
  onShareLink: () => void;
  onReset: () => void;
  onNativeShare?: () => void;
  hasImage: boolean;
}

export function Toolbar({
  onCopy,
  onDownload,
  onShareLink,
  onReset,
  onNativeShare,
  hasImage,
}: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "6px",
        background: "rgba(255,255,255,0.92)",
        borderRadius: "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: hasImage ? 1 : 0.4,
        pointerEvents: hasImage ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      <ToolbarButton onClick={onCopy} label="Copy" shortcut="Ctrl+C" />
      <ToolbarButton onClick={onDownload} label="Save" shortcut="Ctrl+S" />
      <ToolbarButton onClick={onShareLink} label="Link" />
      {onNativeShare && <ToolbarButton onClick={onNativeShare} label="Share" />}
      <ToolbarButton onClick={onReset} label="Reset" />
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  shortcut,
}: {
  onClick: () => void;
  label: string;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      style={{
        padding: "8px 14px",
        borderRadius: "14px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#222",
        background: "#f0f0f0",
        transition: "background 0.15s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#e4e4e4";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f0f0f0";
      }}
    >
      {label}
    </button>
  );
}
