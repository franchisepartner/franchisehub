import { useState } from "react";

export default function UcupChat() {
  const [chat, setChat] = useState<{ from: "user" | "ucup", text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMsg() {
    if (!input.trim()) return;
    setLoading(true);
    setChat([...chat, { from: "user", text: input }]);
    setInput("");
    const res = await fetch("/api/ucup-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input })
    });
    const data = await res.json();
    setChat(chat => [...chat, { from: "ucup", text: data.reply }]);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-xs">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-blue-200">
        <div className="mb-3 font-bold text-blue-800 flex items-center gap-2">
          <span>🐣</span> Ucup - FranchiseNusantara
        </div>
        <div className="h-52 overflow-y-auto mb-2 flex flex-col gap-2 bg-gray-50 p-2 rounded">
          {chat.map((c, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg ${c.from === "user" ? "bg-blue-100 self-end" : "bg-yellow-50 self-start border border-yellow-200"}`}
            >
              {c.text}
            </div>
          ))}
          {loading && <div className="text-xs text-gray-500">Ucup lagi mikir, sabar yo...</div>}
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
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
