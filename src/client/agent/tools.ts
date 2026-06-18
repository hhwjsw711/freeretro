import type {
  Card,
  ClientMessage,
  ColumnId,
  Reaction,
  RetroColumn,
  RetroUser,
  Upvote,
} from "../../types";
import { COLUMNS } from "../../types";
import type { AgentTool, ToolResult } from "./webmcp";
import type { Embodiment, InteractionMode } from "./embodiment";

export interface BoardSnapshot {
  cards: Card[];
  columns: RetroColumn[];
  users: RetroUser[];
  reactions: Reaction[];
  upvotes: Upvote[];
  blurred: boolean;
  sortByUpvotes: boolean;
}

export interface ToolContext {
  send: (msg: ClientMessage) => void;
  getState: () => BoardSnapshot;
  embodiment: Embodiment;
  setName: (name: string) => void;
}

function ok(text: string): ToolResult {
  return { content: [{ type: "text", text }] };
}

function err(text: string): ToolResult {
  return { content: [{ type: "text", text }], isError: true };
}

function json(value: unknown): ToolResult {
  return ok(JSON.stringify(value, null, 2));
}

function isColumnId(value: unknown): value is ColumnId {
  return typeof value === "string" && (COLUMNS as string[]).includes(value);
}

function endOfColumnPosition(cards: Card[], columnId: ColumnId): number {
  const inColumn = cards
    .filter((c) => c.columnId === columnId && c.groupId === null)
    .sort((a, b) => a.position - b.position);
  const last = inColumn[inColumn.length - 1];
  return last ? last.position + 1 : 1;
}

const columnSchema = {
  type: "string",
  enum: [...COLUMNS],
  description: "列 ID: highlights, challenges, questions, notes。",
};

export function createTools(ctx: ToolContext): AgentTool[] {
  const { send, getState, embodiment, setName } = ctx;

  return [
    {
      name: "list_cards",
      description: "列出看板上所有卡片，包括所属列、作者、内容、点赞数和回应。",
      execute: () => {
        const { cards, upvotes, reactions } = getState();
        return json(
          cards.map((card) => ({
            id: card.id,
            columnId: card.columnId,
            content: card.content,
            author: card.author,
            groupId: card.groupId,
            upvotes: upvotes.filter((u) => u.cardId === card.id).length,
            reactions: reactions
              .filter((r) => r.cardId === card.id)
              .reduce<Record<string, number>>((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                return acc;
              }, {}),
          })),
        );
      },
    },
    {
      name: "list_columns",
      description: "列出看板的所有列，包括标签和卡片数量。",
      execute: () => {
        const { columns, cards } = getState();
        return json(
          columns.map((column) => ({
            id: column.id,
            label: column.label,
            position: column.position,
            cardCount: cards.filter((c) => c.columnId === column.id && c.groupId === null).length,
          })),
        );
      },
    },
    {
      name: "list_users",
      description: "列出当前连接到本省思的人员和代理。",
      execute: () => {
        const { users } = getState();
        return json(users.map((u) => ({ id: u.id, name: u.name, color: u.color })));
      },
    },
    {
      name: "get_board_state",
      description: "获取看板全局状态：卡片是否模糊、排序模式以及统计信息。",
      execute: () => {
        const { blurred, sortByUpvotes, users, cards } = getState();
        return json({ blurred, sortByUpvotes, online: users.length, cardCount: cards.length });
      },
    },
    {
      name: "create_card",
      description: "向指定列添加新卡片。",
      inputSchema: {
        type: "object",
        properties: {
          columnId: columnSchema,
          content: { type: "string", description: "卡片文本。" },
        },
        required: ["columnId", "content"],
      },
      execute: async ({ columnId, content }) => {
        if (!isColumnId(columnId)) return err(`无效的列ID: ${String(columnId)}`);
        if (typeof content !== "string" || !content.trim()) return err("内容不能为空。");
        await embodiment.click({ type: "add-card", columnId });
        send({ type: "card:create", columnId, content: content.trim() });
        return ok(`已在 ${columnId} 添加卡片。`);
      },
    },
    {
      name: "edit_card",
      description: "替换已有卡片的文本内容。",
      inputSchema: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          content: { type: "string", description: "新的卡片文本。" },
        },
        required: ["cardId", "content"],
      },
      execute: async ({ cardId, content }) => {
        if (typeof cardId !== "string") return err("cardId 不能为空。");
        if (typeof content !== "string" || !content.trim()) return err("内容不能为空。");
        await embodiment.click({ type: "card-control", cardId, control: "content" });
        send({ type: "card:update", cardId, content: content.trim() });
        return ok(`已更新卡片 ${cardId}。`);
      },
    },
    {
      name: "delete_card",
      description: "删除一张卡片。",
      inputSchema: {
        type: "object",
        properties: { cardId: { type: "string" } },
        required: ["cardId"],
      },
      execute: async ({ cardId }) => {
        if (typeof cardId !== "string") return err("cardId 不能为空。");
        await embodiment.click({ type: "card-control", cardId, control: "delete" });
        send({ type: "card:delete", cardId });
        return ok(`已删除卡片 ${cardId}。`);
      },
    },
    {
      name: "move_card",
      description:
        "将卡片移动到另一列。在人类模式下光标会拖拽卡片穿过屏幕；位置默认为目标列的末尾。",
      inputSchema: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          columnId: columnSchema,
          position: { type: "number", description: "可选，显式指定位置。" },
        },
        required: ["cardId", "columnId"],
      },
      execute: async ({ cardId, columnId, position }) => {
        if (typeof cardId !== "string") return err("cardId 不能为空。");
        if (!isColumnId(columnId)) return err(`无效的列ID: ${String(columnId)}`);
        const resolved =
          typeof position === "number" ? position : endOfColumnPosition(getState().cards, columnId);
        await embodiment.drag({ type: "card", cardId }, { type: "column", columnId }, () => {
          send({ type: "card:move", cardId, columnId, position: resolved });
        });
        return ok(`已将卡片 ${cardId} 移动到 ${columnId}。`);
      },
    },
    {
      name: "upvote_card",
      description: "切换对一张卡片的点赞状态。",
      inputSchema: {
        type: "object",
        properties: { cardId: { type: "string" } },
        required: ["cardId"],
      },
      execute: async ({ cardId }) => {
        if (typeof cardId !== "string") return err("cardId 不能为空。");
        await embodiment.click({ type: "card-control", cardId, control: "upvote" });
        send({ type: "upvote:toggle", cardId });
        return ok(`已切换卡片 ${cardId} 的点赞状态。`);
      },
    },
    {
      name: "react_to_card",
      description: "切换对一张卡片的 emoji 回应。",
      inputSchema: {
        type: "object",
        properties: {
          cardId: { type: "string" },
          emoji: { type: "string", description: "一个 emoji，例如 🚀。" },
        },
        required: ["cardId", "emoji"],
      },
      execute: async ({ cardId, emoji }) => {
        if (typeof cardId !== "string") return err("cardId 不能为空。");
        if (typeof emoji !== "string" || !emoji) return err("emoji 不能为空。");
        const hasChip = getState().reactions.some((r) => r.cardId === cardId && r.emoji === emoji);
        const control = hasChip ? `reaction-${emoji}` : "react";
        await embodiment.click({ type: "card-control", cardId, control });
        send({ type: "reaction:toggle", cardId, emoji });
        return ok(`已切换 ${emoji} 在卡片 ${cardId} 上的回应。`);
      },
    },
    {
      name: "rename_column",
      description: "重命名一列。",
      inputSchema: {
        type: "object",
        properties: {
          columnId: columnSchema,
          label: { type: "string", description: "新的列标签。" },
        },
        required: ["columnId", "label"],
      },
      execute: async ({ columnId, label }) => {
        if (!isColumnId(columnId)) return err(`无效的列ID: ${String(columnId)}`);
        if (typeof label !== "string" || !label.trim()) return err("label 不能为空。");
        await embodiment.click({ type: "column-control", columnId, control: "rename" });
        send({ type: "column:update", columnId, label: label.trim() });
        return ok(`已将 ${columnId} 重命名为 "${label.trim()}"。`);
      },
    },
    {
      name: "set_blur",
      description: "为省思中的所有参与者模糊或显示所有卡片。",
      inputSchema: {
        type: "object",
        properties: { blurred: { type: "boolean" } },
        required: ["blurred"],
      },
      execute: ({ blurred }) => {
        send({ type: "blur:set", blurred: Boolean(blurred) });
        return ok(`已将模糊状态设为 ${Boolean(blurred)}。`);
      },
    },
    {
      name: "set_sort",
      description: "按点赞数排序卡片，或恢复为手动顺序。",
      inputSchema: {
        type: "object",
        properties: { sortByUpvotes: { type: "boolean" } },
        required: ["sortByUpvotes"],
      },
      execute: ({ sortByUpvotes }) => {
        send({ type: "sort:set", sortByUpvotes: Boolean(sortByUpvotes) });
        return ok(`已将 sortByUpvotes 设为 ${Boolean(sortByUpvotes)}。`);
      },
    },
    {
      name: "set_name",
      description: "设置你在省思中对外显示的名称。",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "你的显示名称。" },
        },
        required: ["name"],
      },
      execute: ({ name }) => {
        if (typeof name !== "string" || !name.trim()) return err("名称不能为空。");
        setName(name.trim());
        return ok(`已将名称设为 "${name.trim()}"。`);
      },
    },
    {
      name: "set_cursor",
      description: "将你的可见光标移动到视口坐标，让其他人看到你指向的位置。",
      inputSchema: {
        type: "object",
        properties: {
          x: { type: "number", description: "视口 x 坐标（像素）。" },
          y: { type: "number", description: "视口 y 坐标（像素）。" },
        },
        required: ["x", "y"],
      },
      execute: async ({ x, y }) => {
        if (typeof x !== "number" || typeof y !== "number") return err("x 和 y 不能为空。");
        await embodiment.point(x, y);
        return ok(`已将光标移动到 (${x}, ${y})。`);
      },
    },
    {
      name: "set_interaction_mode",
      description:
        '设置操作的执行方式："human"（人类）会让光标滑到每个目标，便于他人跟随；"direct"（直接）则会即时应用更改。',
      inputSchema: {
        type: "object",
        properties: { mode: { type: "string", enum: ["human", "direct"] } },
        required: ["mode"],
      },
      execute: ({ mode }) => {
        if (mode !== "human" && mode !== "direct") return err('mode 必须是 "human" 或 "direct"。');
        embodiment.setMode(mode as InteractionMode);
        return ok(`交互模式已设为 ${mode}。`);
      },
    },
  ];
}
