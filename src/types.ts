// Column definitions
export const COLUMNS = ["start", "stop", "continue", "notes", "actions"] as const;
export type ColumnId = (typeof COLUMNS)[number];

export const COLUMN_LABELS: Record<ColumnId, string> = {
  start: "Start",
  stop: "Stop",
  continue: "Continue",
  notes: "Notes",
  actions: "Action Items",
};

// Data models
export interface Card {
  id: string;
  columnId: ColumnId;
  content: string;
  author: string;
  groupId: string | null;
  position: number;
  createdAt: number;
}

export interface Reaction {
  cardId: string;
  emoji: string;
  userName: string;
}

export interface RetroUser {
  id: string;
  name: string;
  color: string;
}

export interface RetroSummary {
  id: string;
  title: string;
  createdAt: number;
  createdBy: string | null;
}

// WebSocket messages: Client → Server
export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "cursor"; x: number; y: number }
  | { type: "card:create"; columnId: ColumnId; content: string }
  | { type: "card:update"; cardId: string; content: string }
  | { type: "card:delete"; cardId: string }
  | { type: "card:move"; cardId: string; columnId: ColumnId; position: number }
  | { type: "card:group"; cardId: string; targetCardId: string }
  | { type: "card:ungroup"; cardId: string }
  | { type: "reaction:toggle"; cardId: string; emoji: string };

// WebSocket messages: Server → Client
export type ServerMessage =
  | {
      type: "state";
      cards: Card[];
      reactions: Reaction[];
      users: RetroUser[];
    }
  | { type: "user:joined"; user: RetroUser }
  | { type: "user:left"; userId: string }
  | { type: "cursor"; userId: string; name: string; x: number; y: number }
  | { type: "card:created"; card: Card }
  | { type: "card:updated"; card: Card }
  | { type: "card:deleted"; cardId: string }
  | { type: "card:moved"; card: Card }
  | { type: "card:grouped"; cardId: string; groupId: string }
  | { type: "card:ungrouped"; cardId: string; columnId: ColumnId; position: number }
  | { type: "retro:deleted" }
  | {
      type: "reaction:toggled";
      cardId: string;
      emoji: string;
      userName: string;
      reactions: Reaction[];
    };

// User colors for cursors
export const USER_COLORS = [
  "#FF4801",
  "#0A95FF",
  "#EE0DDB",
  "#19E306",
  "#9616FF",
  "#FF9900",
  "#4285F4",
  "#E91E63",
  "#00BCD4",
  "#FF5722",
  "#8BC34A",
  "#FFC107",
];
