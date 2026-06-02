import { useState, useRef, useEffect } from "react";

interface EmojiReactionProps {
  onSelect: (emoji: string) => void;
}

const QUICK_EMOJIS = ["👍", "👎", "❤️", "🎉", "🤔", "👀", "🔥", "💯", "😂", "😢", "🚀", "⭐"];

export function EmojiReaction({ onSelect }: EmojiReactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-cf-border text-cf-text-muted hover:border-cf-orange hover:text-cf-orange inline-flex items-center rounded-full border border-dashed px-2 py-0.5 text-xs transition-all"
      >
        +
      </button>

      {isOpen && (
        <div className="border-cf-border bg-cf-bg-card absolute bottom-full left-0 z-50 mb-1 rounded-lg border p-2 shadow-lg">
          <div className="grid grid-cols-6 gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className="hover:bg-cf-bg-hover flex h-8 w-8 items-center justify-center rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
