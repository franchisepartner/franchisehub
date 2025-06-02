// components/CalculatorModal.tsx
import { Dispatch, SetStateAction } from 'react';
import Calculator from './Calculator';

interface CalculatorModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}

export default function CalculatorModal({ show, setShow }: CalculatorModalProps) {
  if (!show) return null;

  return (
    // Latar belakang setengah transparan
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* 
        Container putih untuk kalkulator 
        Bisa diberi rounded-lg dan shadow untuk tampilan lebih bagus
      */}
      <div className="bg-white rounded-lg shadow-2xl w-11/12 max-w-md mx-auto p-4 relative">
        {/* Tombol Close (pojok kanan atas) */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Komponen Kalkulator */}
        <Calculator />
      </div>
    </div>
  );
}
