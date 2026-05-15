import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";

type Align = "left" | "right" | "center";

type MenuPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

const VIEWPORT_GUTTER = 8;
const MENU_GAP = 10;
const DROPDOWN_Z_INDEX = 9000;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PortalMenu({
  open,
  anchorRef,
  onClose,
  children,
  align = "left",
  width,
  minWidth = 224,
  matchAnchorWidth = false,
  className,
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement>;
  onClose: () => void;
  children: ReactNode;
  align?: Align;
  width?: number;
  minWidth?: number;
  matchAnchorWidth?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition>({ left: 0, top: 0, width: minWidth, maxHeight: 280, openUp: false });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === "undefined") return;

    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const desiredWidth = Math.min(width ?? (matchAnchorWidth ? rect.width : minWidth), viewportWidth - VIEWPORT_GUTTER * 2);
    const measuredHeight = panelRef.current?.offsetHeight ?? 280;
    const spaceBelow = viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_GUTTER;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_GUTTER;
    const openUp = spaceBelow < Math.min(220, measuredHeight) && spaceAbove > spaceBelow;
    const availableSpace = Math.max(160, openUp ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(420, availableSpace);
    const panelHeight = Math.min(measuredHeight, maxHeight);

    let left = rect.left;
    if (align === "right") left = rect.right - desiredWidth;
    if (align === "center") left = rect.left + rect.width / 2 - desiredWidth / 2;

    setPosition({
      left: clamp(left, VIEWPORT_GUTTER, Math.max(VIEWPORT_GUTTER, viewportWidth - desiredWidth - VIEWPORT_GUTTER)),
      top: openUp ? Math.max(VIEWPORT_GUTTER, rect.top - panelHeight - MENU_GAP) : rect.bottom + MENU_GAP,
      width: desiredWidth,
      maxHeight,
      openUp,
    });
  }, [align, anchorRef, matchAnchorWidth, minWidth, width]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
  }, [anchorRef, onClose, open, updatePosition]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: position.left,
            top: position.top,
            width: position.width,
            maxHeight: position.maxHeight,
            zIndex: DROPDOWN_Z_INDEX,
            transformOrigin: position.openUp ? "bottom center" : "top center",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={cn(
            "overflow-y-auto overscroll-contain rounded-[18px] border border-[rgba(0,242,254,0.35)] bg-[#0b1828] p-2 text-[#f8fafc] shadow-[0_20px_60px_rgba(0,242,254,0.18),0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-[18px]",
            className,
          )}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
