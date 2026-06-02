import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RetroSummary } from "../../types";
import { Footer } from "../components/Footer";

export function Home() {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const createRetro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || creating) return;

    setCreating(true);
    const res = await fetch("/api/retros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    const retro = (await res.json()) as RetroSummary;
    setTitle("");
    setCreating(false);
    navigate(`/retro/${retro.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-cf-text mb-5 text-7xl leading-none font-medium tracking-tight sm:text-8xl md:text-9xl">
            Free Retro
          </h1>
          <p className="text-cf-text-muted text-xl">
            Run lightweight retros with your team, for free.
          </p>
        </header>

        <form onSubmit={createRetro} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sprint 42 Retro..."
            className="border-cf-border bg-cf-bg-card text-cf-text placeholder:text-cf-text-muted focus:border-cf-orange focus:ring-cf-orange flex-1 rounded-lg border p-3 outline-none focus:ring-1"
          />
          <button
            type="submit"
            disabled={!title.trim() || creating}
            className="border-cf-orange bg-cf-orange rounded-full border px-6 py-3 font-medium text-white transition-all hover:opacity-95 active:translate-y-[1px] active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create retro"}
          </button>
        </form>
        <p className="text-cf-text-muted mt-4 text-center text-sm">
          Each retro gets a unique unguessable URL. Anyone with the link can join.
        </p>
      </main>
      <Footer />
    </div>
  );
}
