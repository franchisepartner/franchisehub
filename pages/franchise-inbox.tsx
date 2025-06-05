'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase } from '../lib/supabaseClient';

const socket = io('https://franchisehub-chat-backend-production.up.railway.app');

interface FranchiseInboxMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  message: string;
  created_at: string;
}

export default function FranchiseInbox({ receiverId, listingId }: { receiverId: string; listingId: string }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<FranchiseInboxMessage[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user.id || '');
      socket.emit('join_inbox', session?.user.id || '');
    };
    fetchUser();
  }, []);

  useEffect(() => {
    socket.on('receive_inbox_message', (msg: FranchiseInboxMessage) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
    
    return () => {
      socket.off('receive_inbox_message');
    };
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
    <div className="flex flex-col h-[80vh] border rounded shadow-md overflow-hidden">
      <div className="flex-1 p-4 overflow-auto bg-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.sender_id === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender_id === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-black'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <div className="flex p-3 bg-white border-t">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pesan..."
        />

        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
