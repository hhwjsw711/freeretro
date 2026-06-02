import { useEffect, useCallback, useReducer } from "react";
import type { Card, Reaction, RetroUser, ServerMessage, ColumnId } from "../../types";

interface RetroState {
  cards: Card[];
  reactions: Reaction[];
  users: RetroUser[];
  loaded: boolean;
}

type RetroAction =
  | { type: "state"; cards: Card[]; reactions: Reaction[]; users: RetroUser[] }
  | { type: "user:joined"; user: RetroUser }
  | { type: "user:left"; userId: string }
  | { type: "card:created"; card: Card }
  | { type: "card:updated"; card: Card }
  | { type: "card:deleted"; cardId: string }
  | { type: "card:moved"; card: Card }
  | { type: "card:grouped"; cardId: string; groupId: string }
  | { type: "card:ungrouped"; cardId: string; columnId: ColumnId; position: number }
  | { type: "reaction:toggled"; cardId: string; reactions: Reaction[] };

function reducer(state: RetroState, action: RetroAction): RetroState {
  switch (action.type) {
    case "state":
      return {
        cards: action.cards,
        reactions: action.reactions,
        users: action.users,
        loaded: true,
      };

    case "user:joined": {
      const existing = state.users.find((u) => u.id === action.user.id);
      if (existing) {
        return {
          ...state,
          users: state.users.map((u) => (u.id === action.user.id ? action.user : u)),
        };
      }
      return { ...state, users: [...state.users, action.user] };
    }

    case "user:left":
      return { ...state, users: state.users.filter((u) => u.id !== action.userId) };

    case "card:created":
      return { ...state, cards: [...state.cards, action.card] };

    case "card:updated":
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? action.card : c)),
      };

    case "card:deleted":
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.cardId && c.groupId !== action.cardId),
        reactions: state.reactions.filter((r) => r.cardId !== action.cardId),
      };

    case "card:moved":
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? action.card : c)),
      };

    case "card:grouped":
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.cardId ? { ...c, groupId: action.groupId } : c,
        ),
      };

    case "card:ungrouped":
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.cardId
            ? { ...c, groupId: null, columnId: action.columnId, position: action.position }
            : c,
        ),
      };

    case "reaction:toggled": {
      const otherReactions = state.reactions.filter((r) => r.cardId !== action.cardId);
      return { ...state, reactions: [...otherReactions, ...action.reactions] };
    }

    default:
      return state;
  }
}

const initialState: RetroState = { cards: [], reactions: [], users: [], loaded: false };

export function useRetroState(subscribe: (handler: (msg: ServerMessage) => void) => () => void) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    return subscribe((msg) => {
      switch (msg.type) {
        case "state":
          dispatch({ type: "state", cards: msg.cards, reactions: msg.reactions, users: msg.users });
          break;
        case "user:joined":
          dispatch({ type: "user:joined", user: msg.user });
          break;
        case "user:left":
          dispatch({ type: "user:left", userId: msg.userId });
          break;
        case "card:created":
          dispatch({ type: "card:created", card: msg.card });
          break;
        case "card:updated":
          dispatch({ type: "card:updated", card: msg.card });
          break;
        case "card:deleted":
          dispatch({ type: "card:deleted", cardId: msg.cardId });
          break;
        case "card:moved":
          dispatch({ type: "card:moved", card: msg.card });
          break;
        case "card:grouped":
          dispatch({ type: "card:grouped", cardId: msg.cardId, groupId: msg.groupId });
          break;
        case "card:ungrouped":
          dispatch({
            type: "card:ungrouped",
            cardId: msg.cardId,
            columnId: msg.columnId,
            position: msg.position,
          });
          break;
        case "reaction:toggled":
          dispatch({
            type: "reaction:toggled",
            cardId: msg.cardId,
            reactions: msg.reactions,
          });
          break;
      }
    });
  }, [subscribe]);

  const getCardsForColumn = useCallback(
    (columnId: ColumnId) => {
      return state.cards
        .filter((c) => c.columnId === columnId && c.groupId === null)
        .sort((a, b) => a.position - b.position);
    },
    [state.cards],
  );

  const getGroupedCards = useCallback(
    (groupId: string) => {
      return state.cards
        .filter((c) => c.groupId === groupId)
        .sort((a, b) => a.position - b.position);
    },
    [state.cards],
  );

  const getReactionsForCard = useCallback(
    (cardId: string) => {
      return state.reactions.filter((r) => r.cardId === cardId);
    },
    [state.reactions],
  );

  return {
    ...state,
    getCardsForColumn,
    getGroupedCards,
    getReactionsForCard,
  };
}
