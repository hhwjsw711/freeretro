import { useEffect, useRef, useCallback, useState } from "react";
import type { ClientMessage, ServerMessage } from "../../types";

type MessageHandler = (msg: ServerMessage) => void;

export function useWebSocket(retroId: string, name: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const userIdRef = useRef(crypto.randomUUID());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${location.host}/api/ws/${retroId}?userId=${userIdRef.current}&name=${encodeURIComponent(name)}`;
    const ws = new WebSocket(url);

    ws.addEventListener("open", () => {
      setConnected(true);
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        for (const handler of handlersRef.current) {
          handler(msg);
        }
      } catch {
        // Ignore non-JSON messages (like pong)
      }
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      // Reconnect after 1 second
      reconnectTimeoutRef.current = setTimeout(connect, 1000);
    });

    ws.addEventListener("error", () => {
      ws.close();
    });

    wsRef.current = ws;
  }, [retroId, name]);

  useEffect(() => {
    if (name) {
      connect();
    }
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, name]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const subscribe = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  return { send, subscribe, connected, userId: userIdRef.current };
}
