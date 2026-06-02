import { useRef, useEffect, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Card as CardType, Reaction, ColumnId, ClientMessage } from "../../types";
import { RetroCard } from "./Card";
import { CardForm } from "./CardForm";

interface ColumnProps {
  columnId: ColumnId;
  label: string;
  cards: CardType[];
  getGroupedCards: (groupId: string) => CardType[];
  getReactionsForCard: (cardId: string) => Reaction[];
  send: (msg: ClientMessage) => void;
  userName: string;
  allCards: CardType[];
}

const COLUMN_COLORS: Record<ColumnId, string> = {
  start: "bg-emerald-50 border-emerald-200",
  stop: "bg-red-50 border-red-200",
  continue: "bg-blue-50 border-blue-200",
  notes: "bg-amber-50 border-amber-200",
  actions: "bg-purple-50 border-purple-200",
};

const COLUMN_ACCENT: Record<ColumnId, string> = {
  start: "text-emerald-700",
  stop: "text-red-700",
  continue: "text-blue-700",
  notes: "text-amber-700",
  actions: "text-purple-700",
};

export function Column({
  columnId,
  label,
  cards,
  getGroupedCards,
  getReactionsForCard,
  send,
  userName,
  allCards,
}: ColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ columnId }),
      canDrop: ({ source }) => {
        return source.data.type === "card";
      },
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: ({ source }) => {
        setIsDragOver(false);
        const cardId = source.data.cardId as string;
        const sourceColumnId = source.data.columnId as string;

        if (sourceColumnId !== columnId) {
          // Calculate position at the end of this column
          const lastCard = cards[cards.length - 1];
          const position = lastCard ? lastCard.position + 1 : 1;

          send({
            type: "card:move",
            cardId,
            columnId,
            position,
          });
        }
      },
    });
  }, [columnId, cards, send]);

  const handleCreateCard = (content: string) => {
    send({ type: "card:create", columnId, content });
  };

  return (
    <div
      ref={columnRef}
      className={`flex w-72 min-w-72 flex-col rounded-xl border ${COLUMN_COLORS[columnId]} transition-all ${
        isDragOver ? "ring-cf-orange ring-opacity-50 ring-2" : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className={`font-medium tracking-tight ${COLUMN_ACCENT[columnId]}`}>{label}</h2>
        <span className="text-cf-text-muted text-xs">{cards.length}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {cards.map((card, index) => (
          <RetroCard
            key={card.id}
            card={card}
            index={index}
            groupedCards={getGroupedCards(card.id)}
            reactions={getReactionsForCard(card.id)}
            send={send}
            userName={userName}
            allCards={allCards}
          />
        ))}
        <CardForm onSubmit={handleCreateCard} />
      </div>
    </div>
  );
}
