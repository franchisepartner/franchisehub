import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from '@supabase/auth-helpers-react';

const socket = io('https://easygoing-quietude.up.railway.app');

export default function ChatPasarPopup({ onClose }: { onClose: () => void }) {
  const user = useUser();
  const popupRef = useRef(null);
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
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
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
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white shadow-2xl rounded-lg flex flex-col z-50" ref={popupRef}>
      <div className="p-2 border-b flex justify-between items-center">
        <span className="font-semibold">🌐 Chat Pasar</span>
        <button onClick={onClose} className="text-gray-500">✖️</button>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-3 p-2 rounded bg-gray-100 text-sm shadow">
            <div className="font-bold text-blue-600">
              {msg.sender_name}_{msg.sender_role}
            </div>
            <div className="text-gray-800">
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border rounded p-1 text-sm"
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-1 rounded">Kirim</button>
      </div>
    </div>
  );
}
