interface ToastMessageProps {
  message: string;
}

export function ToastMessage({ message }: ToastMessageProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "12px 24px",
        borderRadius: "16px",
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 500,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}
