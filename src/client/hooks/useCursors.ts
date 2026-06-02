import { useEffect, useRef, useCallback, useState } from "react";
import type { ClientMessage, ServerMessage } from "../../types";

interface CursorPosition {
  x: number;
  y: number;
  name: string;
  color: string;
  lastSeen: number;
}

export function useCursors(
  send: (msg: ClientMessage) => void,
  subscribe: (handler: (msg: ServerMessage) => void) => () => void,
  userId: string,
  users: { id: string; name: string; color: string }[],
) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const lastSendRef = useRef(0);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Track remote cursors
  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === "cursor" && msg.userId !== userId) {
        setCursors((prev) => {
          const next = new Map(prev);
          const user = users.find((u) => u.id === msg.userId);
          next.set(msg.userId, {
            x: msg.x,
            y: msg.y,
            name: msg.name,
            color: user?.color ?? "#FF4801",
            lastSeen: Date.now(),
          });
          return next;
        });
      }

      if (msg.type === "user:left") {
        setCursors((prev) => {
          const next = new Map(prev);
          next.delete(msg.userId);
          return next;
        });
      }
    });
  }, [subscribe, userId, users]);

  // Clean up stale cursors every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors((prev) => {
        const now = Date.now();
        const next = new Map(prev);
        for (const [id, cursor] of next) {
          if (now - cursor.lastSeen > 5000) {
            next.delete(id);
          }
        }
        return next.size !== prev.size ? next : prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Broadcast local cursor position
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSendRef.current < 50) return;
      lastSendRef.current = now;

      const board = boardRef.current;
      if (!board) return;

      const rect = board.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      send({ type: "cursor", x, y });
    },
    [send],
  );

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    board.addEventListener("mousemove", handleMouseMove);
    return () => board.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return { cursors, boardRef };
}
