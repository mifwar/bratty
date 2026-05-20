import type { RenderOptions } from "../lib/renderCanvas";

interface StyleControlsProps {
  value: RenderOptions;
  onChange: (value: RenderOptions) => void;
}

export function StyleControls({ value, onChange }: StyleControlsProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "520px",
      }}
    >
      <RangeControl
        label="Padding"
        value={value.padding}
        min={32}
        max={160}
        step={8}
        display={`${value.padding}px`}
        onChange={(padding) => onChange({ padding })}
      />
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "6px 10px",
        padding: "8px 10px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        color: "#222",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      <span>{label}</span>
      <span style={{ color: "#777", fontVariantNumeric: "tabular-nums" }}>
        {display}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          gridColumn: "1 / -1",
          width: "100%",
          accentColor: "#111",
        }}
      />
    </label>
  );
}
