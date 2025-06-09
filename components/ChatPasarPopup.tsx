import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';

const socket = io('https://franchisehub-chat-backend-production.up.railway.app');

function roleColor(role: string) {
  if (role === 'franchisor') return 'bg-red-100 text-red-600 border border-red-200';
  if (role === 'administrator') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-green-100 text-green-700 border border-green-200';
}

export default function ChatPasarPopup({ onClose }: { onClose: () => void }) {
  const user = useUser();
  const popupRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('franchisee');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRole() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data?.role) setRole(data.role);
      }
    }
    fetchRole();
  }, [user]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    async function fetchInitialMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    }
    fetchInitialMessages();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const fullName = user?.user_metadata?.full_name || 'User';

  const sendMessage = () => {
    if (!user || !message.trim()) return;
    const data = {
      sender_id: user.id,
      sender_name: fullName,
      sender_role: role,
      content: message,
    };
    socket.emit('send_message', data);
    setMessage('');
  };

  return (
    <div
      className="fixed bottom-24 right-6 w-80 h-96 shadow-2xl rounded-2xl flex flex-col z-50"
      style={{
        backgroundImage: 'url(/latar.jpg)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)'
      }}
      ref={popupRef}
    >
      <div className="p-3 border-b flex justify-between items-center bg-white/95 rounded-t-2xl">
        <span className="font-bold text-blue-800 text-base flex items-center gap-2">🏪 Chat Pasar</span>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl font-bold px-2">&times;</button>
      </div>
      <div className="flex-1 px-3 py-2 overflow-y-auto bg-white/80">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 p-2 rounded-xl shadow border flex flex-col bg-white/95`}
            style={{
              borderLeftWidth: 5,
              borderLeftColor:
                msg.sender_role === 'franchisor'
                  ? '#ef4444'
                  : msg.sender_role === 'administrator'
                  ? '#2563eb'
                  : '#22c55e',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-800 truncate">{msg.sender_name}</span>
              <span
                className={
                  "px-2 py-0.5 rounded text-xs font-bold border " + roleColor(msg.sender_role)
                }
              >
                {msg.sender_role === 'franchisor'
                  ? 'Franchisor'
                  : msg.sender_role === 'administrator'
                  ? 'Administrator'
                  : 'Franchisee'}
              </span>
            </div>
            <div className="text-gray-800 break-words">{msg.content}</div>
            <div className="text-right text-xs text-gray-400 mt-1">
              {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t flex bg-white/95 rounded-b-2xl">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
        />
        {user ? (
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-cyan-600 transition"
          >
            Kirim
          </button>
        ) : (
          <button
            className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-xl font-bold cursor-not-allowed"
            disabled
          >
            🔐 Login
          </button>
        )}
      </div>
    </div>
  );
}
