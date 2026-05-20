import { useEffect, useRef, type RefObject } from "react";

interface FloatingInputProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

export function FloatingInput({
  value,
  onChange,
  inputRef,
}: FloatingInputProps) {
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? localTextareaRef;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [textareaRef, value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  return (
    <div style={{ width: "100%" }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="type something..."
        rows={1}
        style={{
          width: "100%",
          maxHeight: "120px",
          padding: "12px 16px",
          borderRadius: "20px",
          border: "1px solid #e0e0e0",
          background: "#fff",
          fontSize: "16px",
          lineHeight: 1.4,
          outline: "none",
          resize: "none",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          color: "#111",
        }}
      />
    </div>
  );
}
