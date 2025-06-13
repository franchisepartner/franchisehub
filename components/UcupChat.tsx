import { useState, useEffect, useRef } from "react";

export default function UcupChat() {
  const [chat, setChat] = useState<{ from: "user" | "ucup", text: string }[]>([
    {
      from: "ucup",
      text:
        "Monggo panjenengan tanya, Ucup siap bantu rek 🐣. Ada yang bisa Ucup bantu hari ini? Soal franchise, peluang usaha, atau mungkin tips legalitas?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Scroll otomatis ke bawah saat ada chat baru
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat, loading]);

  async function sendMsg() {
    if (!input.trim()) return;
    setLoading(true);
    setChat((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    try {
      const res = await fetch("/api/ucup-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { from: "ucup", text: data.reply }]);
    } catch {
      setChat((prev) => [
        ...prev,
        { from: "ucup", text: "Maaf, Ucup lagi gangguan jaringan, rek!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex items-end"
      style={{
        width: "100vw",
        maxWidth: 420,
        minWidth: "0",
        justifyContent: "flex-end",
        pointerEvents: "auto",
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-blue-200 p-3"
        style={{
          width: "100%",
          maxWidth: 380,
          minWidth: "0",
          maxHeight: "94vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="mb-3 font-bold text-blue-800 flex items-center gap-2">
          <span role="img" aria-label="ucup">🐣</span>
          Ucup AI - FranchiseNusantara
        </div>
        <div
          ref={chatBoxRef}
          className="overflow-y-auto mb-2 flex flex-col gap-2 bg-gray-50 p-2 rounded transition-all"
          style={{
            maxHeight: "52vh",
            minHeight: 110,
            height: "auto",
          }}
        >
          {chat.map((c, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg break-words ${
                c.from === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-yellow-50 self-start border border-yellow-200"
              }`}
              style={{ maxWidth: "88%" }}
            >
              {c.text}
            </div>
          ))}
          {loading && (
            <div className="text-xs text-gray-500">Ucup lagi mikir, sabar yo...</div>
          )}
        </div>
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            sendMsg();
          }}
        >
          <input
            className="flex-1 border border-blue-200 rounded px-3 py-2 text-sm"
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMsg()}
            placeholder="Tanya ke Ucup..."
            style={{ minWidth: 0 }}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            style={{ minWidth: 58 }}
          >
            Kirim
          </button>
        </form>
      </div>
      {/* Responsive style, boleh pakai tailwind atau CSS-in-JS */}
      <style jsx>{`
        @media (max-width: 600px) {
          div[style*="right: 4px"] > div {
            max-width: 99vw !important;
            min-width: 0 !important;
            padding: 7px !important;
            border-radius: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
