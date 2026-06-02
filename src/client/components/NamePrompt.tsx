import { useState } from "react";

interface NamePromptProps {
  onSubmit: (name: string) => void;
}

export function NamePrompt({ onSubmit }: NamePromptProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="bg-cf-bg-page flex flex-1 items-center justify-center px-6">
      <div className="border-cf-border bg-cf-bg-card relative w-full max-w-sm border p-8">
        {/* Corner brackets */}
        <div className="border-cf-border bg-cf-bg-page absolute -top-1 -left-1 h-2 w-2 rounded-[1.5px] border" />
        <div className="border-cf-border bg-cf-bg-page absolute -top-1 -right-1 h-2 w-2 rounded-[1.5px] border" />
        <div className="border-cf-border bg-cf-bg-page absolute -bottom-1 -left-1 h-2 w-2 rounded-[1.5px] border" />
        <div className="border-cf-border bg-cf-bg-page absolute -right-1 -bottom-1 h-2 w-2 rounded-[1.5px] border" />

        <h2 className="text-cf-text mb-2 text-2xl font-medium tracking-tight">Join retro</h2>
        <p className="text-cf-text-muted mb-6 text-sm">
          Enter your name so others can see who you are.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="border-cf-border bg-cf-bg-page text-cf-text placeholder:text-cf-text-muted focus:border-cf-orange focus:ring-cf-orange w-full rounded-lg border p-3 outline-none focus:ring-1"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-cf-orange w-full rounded-full px-6 py-3 font-medium text-white transition-all hover:opacity-95 active:translate-y-[1px] active:scale-[0.98] disabled:opacity-50"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
