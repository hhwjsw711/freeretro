import { DurableObject } from "cloudflare:workers";
import type { Env } from "./env.d";
import type { RetroSummary } from "./types";

export class RetroRegistry extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS retros (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          created_by TEXT
        )
      `);
    });
  }

  async createRetro(id: string, title: string, createdBy: string | null): Promise<RetroSummary> {
    const createdAt = Date.now();
    this.ctx.storage.sql.exec(
      "INSERT INTO retros (id, title, created_at, created_by) VALUES (?, ?, ?, ?)",
      id,
      title,
      createdAt,
      createdBy,
    );
    return { id, title, createdAt, createdBy };
  }

  async getRetro(id: string): Promise<RetroSummary | null> {
    const cursor = this.ctx.storage.sql.exec<{
      id: string;
      title: string;
      created_at: number;
      created_by: string | null;
    }>("SELECT id, title, created_at, created_by FROM retros WHERE id = ?", id);

    const row = [...cursor][0];
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      createdBy: row.created_by,
    };
  }

  async deleteRetro(id: string): Promise<void> {
    this.ctx.storage.sql.exec("DELETE FROM retros WHERE id = ?", id);
  }
}
