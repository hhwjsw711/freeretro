import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("API endpoints", () => {
  it("does not expose a retro listing", async () => {
    const res = await SELF.fetch("http://localhost/api/retros");
    expect(res.status).toBe(404);
  });

  it("POST /api/retros creates an unlisted retro with a UUID", async () => {
    const res = await SELF.fetch("http://localhost/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Retro" }),
    });
    expect(res.status).toBe(201);
    const retro = (await res.json()) as { id: string; title: string };
    expect(retro.title).toBe("Test Retro");
    expect(retro.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("GET /api/retros/:id returns a single retro", async () => {
    const createRes = await SELF.fetch("http://localhost/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Find Me" }),
    });
    const created = (await createRes.json()) as { id: string };

    const res = await SELF.fetch(`http://localhost/api/retros/${created.id}`);
    expect(res.status).toBe(200);
    const retro = (await res.json()) as { id: string; title: string };
    expect(retro.id).toBe(created.id);
    expect(retro.title).toBe("Find Me");
  });

  it("PUT /api/retros/:id renames a retro", async () => {
    const createRes = await SELF.fetch("http://localhost/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Old Name" }),
    });
    const created = (await createRes.json()) as { id: string };

    const res = await SELF.fetch(`http://localhost/api/retros/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Name" }),
    });
    expect(res.status).toBe(200);
    const retro = (await res.json()) as { id: string; title: string };
    expect(retro.id).toBe(created.id);
    expect(retro.title).toBe("New Name");
  });

  it("PUT /api/retros/:id rejects empty titles", async () => {
    const res = await SELF.fetch("http://localhost/api/retros/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/retros rejects empty title", async () => {
    const res = await SELF.fetch("http://localhost/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/retros rejects missing title", async () => {
    const res = await SELF.fetch("http://localhost/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("DELETE /api/retros/:id deletes a retro", async () => {
    // Create first
    const createRes = await SELF.fetch("http://localhost/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "To Delete" }),
    });
    const retro = (await createRes.json()) as { id: string };

    // Delete
    const deleteRes = await SELF.fetch(`http://localhost/api/retros/${retro.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(200);

    const getRes = await SELF.fetch(`http://localhost/api/retros/${retro.id}`);
    expect(getRes.status).toBe(404);
  });

  it("GET /api/ws/:retroId without upgrade header returns 426", async () => {
    const res = await SELF.fetch("http://localhost/api/ws/test-room");
    expect(res.status).toBe(426);
  });
});
