import React, { useEffect, useRef, useState } from "react";
import "../styles/components.css";

type Option = { value: string | number; label: string; disabled?: boolean };

interface CustomSelectProps {
  id?: string;
  value: string | number | "";
  options: Option[];
  onChange: (v: string | number) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

const isMobileWidth = () =>
  typeof window !== "undefined" ? window.innerWidth <= 768 : false;

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  options,
  onChange,
  placeholder,
  className,
  name,
}) => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(isMobileWidth());
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [anchor, setAnchor] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(isMobileWidth());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const computeAnchor = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const windowH = window.innerHeight;
    const panelMaxHeight = Math.floor(windowH * 0.6);
    const spaceBelow = windowH - rect.bottom;
    const openDown = spaceBelow >= panelMaxHeight / 2;
    const top = openDown
      ? rect.bottom + 8
      : Math.max(8, rect.top - 8 - panelMaxHeight);
    const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 16);
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - 8 - width),
    );
    return { top, left, width, maxHeight: panelMaxHeight };
  };

  useEffect(() => {
    if (open) {
      const anchorVal = computeAnchor();
      if (anchorVal) setAnchor(anchorVal);
      const handleScrollOrResize = () => {
        const a = computeAnchor();
        if (a) setAnchor(a);
      };
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    } else {
      setAnchor(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && panelRef.current) panelRef.current.focus();
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));

  if (!isMobile) {
    return (
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className ?? "select-primary"}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={String(o.value)} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  const handleToggle = () => {
    if (!open) {
      const a = computeAnchor();
      if (a) setAnchor(a);
    }
    setOpen((s) => !s);
  };

  return (
    <div className={`custom-select ${className ?? ""}`}>
      <div
        id={id}
        ref={buttonRef}
        role="button"
        tabIndex={0}
        className="custom-select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span
          className={`custom-select-value ${!selected ? "placeholder" : ""}`}
        >
          {selected?.label ?? placeholder ?? "Seleccionar..."}
        </span>
        <span className="custom-select-caret" aria-hidden>
          ▾
        </span>
      </div>

      {open && (
        <div
          className="custom-select-modal"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="custom-select-panel"
            role="listbox"
            aria-label={name || "Selector"}
            tabIndex={-1}
            ref={panelRef}
            style={{
              position: "absolute",
              top: anchor ? `${anchor.top}px` : undefined,
              left: anchor ? `${anchor.left}px` : undefined,
              width: anchor ? `${anchor.width}px` : undefined,
              maxHeight: anchor ? `${anchor.maxHeight}px` : undefined,
            }}
          >
            {options.map((o) => {
              const sel = String(o.value) === String(value);
              return (
                <div
                  key={String(o.value)}
                  role="option"
                  aria-selected={sel}
                  aria-disabled={o.disabled}
                  tabIndex={o.disabled ? -1 : 0}
                  className={`custom-select-option ${sel ? "selected" : ""} ${o.disabled ? "disabled" : ""}`}
                  onClick={() => {
                    if (o.disabled) return;
                    onChange(o.value);
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !o.disabled) {
                      e.preventDefault();
                      onChange(o.value);
                      setOpen(false);
                    }
                    if (e.key === "Escape") setOpen(false);
                  }}
                >
                  {o.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
