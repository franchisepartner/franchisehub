import { useState } from 'react';
import ChatPasarPopup from './ChatPasarPopup';

export default function ChatPasarButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50"
        onClick={() => setOpen(true)}
      >
        💬
      </button>

      {open && (
        <ChatPasarPopup onClose={() => setOpen(false)} />
      )}
    </>
  );
}
