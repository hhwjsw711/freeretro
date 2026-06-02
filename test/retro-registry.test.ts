import { env } from "cloudflare:workers";
import { describe, it, expect } from "vitest";

describe("RetroRegistry", () => {
  it("creates and gets a retro", async () => {
    const id = env.RETRO_REGISTRY.idFromName("global");
    const registry = env.RETRO_REGISTRY.get(id);
    const retroId = crypto.randomUUID();

    const retro = await registry.createRetro(retroId, "Sprint 42 Retro", "Alice");
    expect(retro.id).toBe(retroId);
    expect(retro.title).toBe("Sprint 42 Retro");
    expect(retro.createdBy).toBe("Alice");
    expect(retro.createdAt).toBeGreaterThan(0);

    const found = await registry.getRetro(retroId);
    expect(found).toEqual(retro);
  });

  it("deletes a retro", async () => {
    const id = env.RETRO_REGISTRY.idFromName("global");
    const registry = env.RETRO_REGISTRY.get(id);
    const retroId = crypto.randomUUID();

    await registry.createRetro(retroId, "To Delete", null);
    expect(await registry.getRetro(retroId)).toBeTruthy();

    await registry.deleteRetro(retroId);
    expect(await registry.getRetro(retroId)).toBeNull();
  });

  it("gets a single retro by ID", async () => {
    const id = env.RETRO_REGISTRY.idFromName("global");
    const registry = env.RETRO_REGISTRY.get(id);
    const retroId = crypto.randomUUID();

    await registry.createRetro(retroId, "Get Me", "Bob");
    const retro = await registry.getRetro(retroId);
    expect(retro).toBeTruthy();
    expect(retro!.title).toBe("Get Me");
    expect(retro!.createdBy).toBe("Bob");

    const missing = await registry.getRetro("nonexistent");
    expect(missing).toBeNull();
  });
});
