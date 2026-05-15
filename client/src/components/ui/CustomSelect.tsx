import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";

export type SelectOption = { value: string; label: string; helper?: string };

type FloatingPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

const MENU_GAP = 8;
const VIEWPORT_GUTTER = 8;
const DROPDOWN_Z_INDEX = 9000;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
}: {
  label?: string;
  value?: string;
  options: ReadonlyArray<string | SelectOption>;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<FloatingPosition>({ left: 0, top: 0, width: 0, maxHeight: 280, openUp: false });
  const normalized = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
  const selected = normalized.find((option) => option.value === value);
  const selectedIndex = normalized.findIndex((option) => option.value === value);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === "undefined") return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const desiredWidth = Math.min(rect.width, viewportWidth - VIEWPORT_GUTTER * 2);
    const estimatedHeight = panelRef.current?.offsetHeight ?? Math.min(280, Math.max(64, normalized.length * 58 + 16));
    const spaceBelow = viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_GUTTER;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_GUTTER;
    const openUp = spaceBelow < Math.min(220, estimatedHeight) && spaceAbove > spaceBelow;
    const availableSpace = Math.max(160, openUp ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(280, availableSpace);
    const panelHeight = Math.min(estimatedHeight, maxHeight);
    const left = clamp(rect.left, VIEWPORT_GUTTER, Math.max(VIEWPORT_GUTTER, viewportWidth - desiredWidth - VIEWPORT_GUTTER));
    const top = openUp ? Math.max(VIEWPORT_GUTTER, rect.top - panelHeight - MENU_GAP) : Math.min(viewportHeight - VIEWPORT_GUTTER, rect.bottom + MENU_GAP);

    setPosition({ left, top, width: desiredWidth, maxHeight, openUp });
  }, [normalized.length]);

  const close = useCallback(() => setOpen(false), []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    updatePosition();
    setOpen(true);
  }, [disabled, selectedIndex, updatePosition]);

  const selectOption = useCallback(
    (index: number) => {
      const option = normalized[index];
      if (!option) return;
      onChange(option.value);
      close();
      triggerRef.current?.focus();
    },
    [close, normalized, onChange],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    const handleReposition = () => updatePosition();

    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [close, open, updatePosition]);

  useEffect(() => {
    queueMicrotask(close);
  }, [close, location.pathname]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setActiveIndex((current) => Math.min(current + 1, normalized.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if ((event.key === "Enter" || event.key === " ") && !disabled) {
      event.preventDefault();
      if (open) {
        selectOption(activeIndex);
      } else {
        openMenu();
      }
    }
  };

  const menu = typeof document === "undefined" ? null : createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id={`${id}-listbox`}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="listbox"
          aria-labelledby={id}
          aria-activedescendant={`${id}-option-${activeIndex}`}
          style={{
            position: "fixed",
            left: position.left,
            top: position.top,
            width: position.width,
            maxHeight: position.maxHeight,
            zIndex: DROPDOWN_Z_INDEX,
            transformOrigin: position.openUp ? "bottom center" : "top center",
          }}
          className="overflow-y-auto overscroll-contain rounded-[18px] border border-[rgba(0,242,254,0.35)] bg-[#0b1828] p-2 text-[#f8fafc] shadow-[0_20px_60px_rgba(0,242,254,0.18),0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-[18px]"
        >
          {normalized.map((option, index) => {
            const selectedOption = option.value === value;
            const active = activeIndex === index;
            return (
              <motion.button
                key={option.value}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selectedOption}
                whileHover={{ x: 3 }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-xl border-l-2 border-l-transparent px-3 py-2.5 text-left text-sm text-[#f8fafc] transition",
                  "hover:bg-[rgba(0,242,254,0.12)]",
                  active && "bg-[rgba(0,242,254,0.1)]",
                  selectedOption && "border-l-cyan-200 bg-[rgba(0,242,254,0.22)] text-[#f8fafc]",
                )}
              >
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  {option.helper ? <span className="mt-0.5 block text-xs leading-5 text-[#94a3b8]">{option.helper}</span> : null}
                </span>
                <AnimatePresence>
                  {selectedOption ? (
                    <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 30 }} transition={{ duration: 0.16 }} className="mt-0.5 shrink-0 text-cyan-200">
                      <Check className="size-4" />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div className={cn("relative", className)}>
      {label ? <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">{label}</label> : null}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-[rgba(0,242,254,0.25)] bg-[#122131] px-4 text-left text-sm font-semibold text-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition hover:border-cyan-300/60 hover:bg-[#17283a] focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/25",
          open && "border-cyan-200/70 shadow-[0_0_28px_rgba(0,242,254,0.16),inset_0_0_0_1px_rgba(255,255,255,0.03)]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className={cn("truncate", !selected && "text-slate-500")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-cyan-100/70 transition", open && "rotate-180")} />
      </button>
      {menu}
    </div>
  );
}
