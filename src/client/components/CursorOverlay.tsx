import type { RefObject } from "react";

interface CursorPosition {
  x: number;
  y: number;
  name: string;
  color: string;
  lastSeen: number;
}

interface CursorOverlayProps {
  cursors: Map<string, CursorPosition>;
  boardRef: RefObject<HTMLDivElement | null>;
}

export function CursorOverlay({ cursors, boardRef }: CursorOverlayProps) {
  if (!boardRef.current) return null;

  const rect = boardRef.current.getBoundingClientRect();

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 9999 }}>
      {Array.from(cursors.entries()).map(([id, cursor]) => (
        <div
          key={id}
          className="absolute"
          style={{
            left: rect.left + cursor.x * rect.width,
            top: rect.top + cursor.y * rect.height,
            transition: "left 60ms linear, top 60ms linear",
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="-translate-x-[2px]"
          >
            <path
              d="M0.928711 0.616699L14.2422 10.5767L7.17871 11.5767L4.17871 19.0767L0.928711 0.616699Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          {/* Name label */}
          <span
            className="-mt-1 ml-3 inline-block rounded-full px-2 py-0.5 text-xs whitespace-nowrap text-white shadow-sm"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}
