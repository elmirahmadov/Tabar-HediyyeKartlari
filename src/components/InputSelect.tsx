import { useState, useRef, useEffect } from "react";

export type InputSelectOption = { value: number; label: string };

type InputSelectProps = {
  options: InputSelectOption[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
};

export default function InputSelect({
  options,
  value,
  onChange,
  placeholder = "Seçin",
  label,
  disabled,
}: InputSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  return (
    <div className="input-select-wrap" ref={ref}>
      {label && <label className="input-label">{label}</label>}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`input-select ${open ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className="input-select-value">{display}</span>
        <span className="input-select-arrow" aria-hidden>
          ▼
        </span>
      </div>
      {open && (
        <ul className="input-select-dropdown" role="listbox">
          <li
            role="option"
            className={`input-select-option ${value === 0 ? "selected" : ""}`}
            onClick={() => {
              onChange(0);
              setOpen(false);
            }}
          >
            {placeholder}
          </li>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              className={`input-select-option ${
                value === opt.value ? "selected" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
