import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askAboutMedals } from "@/lib/gemini";
import type { MedalRecord } from "@/data/medals";

const SUGGESTIONS = [
  "Which year had the best gold medal performance?",
  "What is the trend in total medals over time?",
  "Which season performed better overall?",
  "What was the peak year for bronze medals?",
];

type Props = {
  data: MedalRecord[];
  type: "olympics" | "paralympics";
};

const AskAI = ({ data, type }: Props) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const response = await askAboutMedals(q, data, type);
      setAnswer(response);
    } catch (e) {
      setError("Failed to get a response. Check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <section className="dashboard-card rounded-2xl border p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-lg bg-accent text-accent-foreground p-2">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Ask AI</h2>
          <p className="text-sm text-muted-foreground">
            Ask anything about the complete Team USA dataset
          </p>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              ask(s);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-full border bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which year had the most gold medals?"
          className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        <Button
          type="submit"
          disabled={loading || !question.trim()}
          size="sm"
          className="bg-gold text-primary hover:bg-gold/90 border-0 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Response */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing data…
        </div>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
      {answer && !loading && (
        <div className="mt-4 rounded-xl bg-white/10 border border-white/15 p-4 text-sm text-white leading-relaxed whitespace-pre-wrap">
          <span className="text-gold font-semibold text-xs uppercase tracking-wider block mb-2">
            AI Response
          </span>
          {answer}
        </div>
      )}
    </section>
  );
};

export default AskAI;
