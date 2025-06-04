import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';

const socket = io('https://franchisehub-chat-backend-production.up.railway.app');

export default function ChatPasarPopup({ onClose }: { onClose: () => void }) {
  const user = useUser();
  const popupRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');

  interface Message {
    sender_id: string;
    sender_name: string;
    sender_role: string;
    content: string;
    created_at?: Date;
  }

  const [messages, setMessages] = useState<Message[]>([]);

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
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      } else {
        console.error('Gagal mengambil pesan awal:', error);
      }
    }

    fetchInitialMessages();
  }, []);

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
      sender_role: user.user_metadata?.role || 'franchisee',
      content: message,
    };
    socket.emit('send_message', data);
    setMessage('');
  };

  return (
    <div
      className="fixed bottom-24 right-6 w-80 h-96 shadow-2xl rounded-lg flex flex-col z-50"
      style={{ backgroundImage: 'url(/latar.jpg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: 'rgba(255,255,255,4)' }}
      ref={popupRef}
    >
      <div className="p-2 border-b flex justify-between items-center bg-white bg-opacity-90">
        <span className="font-semibold">🏪 Chat Pasar</span>
        <button onClick={onClose} className="text-gray-500">✖️</button>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-3 p-2 rounded bg-white bg-opacity-90 text-sm shadow break-words whitespace-pre-wrap">
            <div className="font-bold text-blue-600">
              {msg.sender_name}_{msg.sender_role}
            </div>
            <div className="text-gray-800">
              {msg.content}
            </div>
            <div className="text-right text-xs text-gray-400">
              {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex bg-white bg-opacity-90">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border rounded p-1 text-sm"
        />
        {user ? (
          <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-1 rounded">
            Kirim
          </button>
        ) : (
          <button className="ml-2 bg-gray-300 text-gray-700 p-1 rounded cursor-not-allowed">
            🔐<br />Login
          </button>
        )}
      </div>
    </div>
  );
}
