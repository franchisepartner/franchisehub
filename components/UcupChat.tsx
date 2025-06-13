import { useRef, useState, useEffect } from "react";

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

  async function sendMsg() {
    if (!input.trim()) return;
    setLoading(true);
    setChat(prev => [...prev, { from: "user", text: input }]);
    setInput("");
    try {
      const res = await fetch("/api/ucup-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();
      setChat(prev => [...prev, { from: "ucup", text: data.reply }]);
    } catch {
      setChat(prev => [...prev, { from: "ucup", text: "Maaf, Ucup lagi gangguan jaringan, rek!" }]);
    } finally {
      setLoading(false);
    }
  }

  // --- Scroll otomatis ke bawah setiap ada chat baru
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat, loading]);

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-blue-200">
        <div className="mb-3 font-bold text-blue-800 flex items-center gap-2 text-base">
          <span>🐣</span> Ucup AI - FranchiseNusantara
        </div>
        <div
          ref={chatBoxRef}
          className="h-64 overflow-y-auto mb-2 flex flex-col gap-2 bg-gray-50 p-2 rounded transition-all"
        >
          {chat.map((c, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg break-words max-w-[85%] ${
                c.from === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-yellow-50 self-start border border-yellow-200"
              }`}
            >
              {c.text}
            </div>
          ))}
          {loading && (
            <div className="text-xs text-gray-500 italic">Ucup lagi mikir, sabar yo...</div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-blue-200 rounded px-3 py-2"
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMsg()}
            placeholder="Tanya ke Ucup..."
          />
          <button
            onClick={sendMsg}
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center"
            style={{ minWidth: 40, minHeight: 40 }}
            aria-label="Kirim"
          >
            {/* Icon search/magnifier */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth={2} />
              <path d="M21 21l-4-4" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
