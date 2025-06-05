'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase } from '../lib/supabaseClient';

const socket = io('https://franchisehub-chat-backend-production.up.railway.app');

interface InboxMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export default function FranchiseInbox({ receiverId, listingId }: { receiverId: string; listingId: string }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id || '');
      socket.emit('join_inbox', session?.user.id || '');
    };
    fetchUser();
  }, []);

  useEffect(() => {
    socket.on('receive_inbox_message', (msg: InboxMessage) => {
      setMessages(prevMessages => [...prevMessages, msg]);
    });
  }, []);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('send_inbox_message', {
        sender_id: userId,
        receiver_id: receiverId,
        listing_id: listingId,
        message,
      });
      setMessage('');
    }
  };

  return (
    <div className="chat-box border rounded p-4 shadow">
      <div className="messages h-64 overflow-auto">
        {messages.map(msg => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.sender_id === userId ? 'Kamu' : 'Lawan bicara'}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <input
        type="text"
        className="border rounded px-3 py-2 w-full mt-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tulis pesan..."
      />

      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={sendMessage}>
        Kirim Pesan
      </button>
    </div>
  );
}
