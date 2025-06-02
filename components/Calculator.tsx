// components/Calculator.tsx
import { useState } from 'react';

export default function Calculator() {
  // state untuk menampung string input (misal: "12+5×3")
  const [expression, setExpression] = useState<string>('');
  // state untuk menampilkan hasil perhitungan
  const [result, setResult] = useState<string>('');

  // Fungsi untuk menambahkan karakter (angka/operator) ke expression
  const handleButtonClick = (value: string) => {
    // Jika user menekan "=" maka kita hitung dulu
    if (value === '=') {
      calculateResult();
      return;
    }

    // Jika user menekan "C", kosongkan keduanya
    if (value === 'C') {
      setExpression('');
      setResult('');
      return;
    }

    // Append karakter baru ke expression
    setExpression((prev) => prev + value);
  };

  // Fungsi untuk menghitung hasil (menggunakan Function constructor)
  const calculateResult = () => {
    try {
      // Kita ubah simbol "×" dan "÷" menjadi "*" dan "/" agar JS bisa mengevaluasi
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/–/g, '-');

      // Gunakan Function untuk mengevaluasi expression
      // NOTE: pastikan expression valid, atau lakukan validasi lebih ketat jika perlu
      // Misalnya, disini kita asumsikan user mengetik angka dan operator dengan benar
      // Jika ada error (misal operator ganda), kita tangani lewat catch
      // eslint-disable-next-line no-new-func
      const evalResult = Function(`"use strict"; return (${sanitized})`)();

      setResult(evalResult.toString());
    } catch (e) {
      setResult('Error');
    }
  };

  // Tombol‐tombol yang ingin kita tampilkan di kalkulator
  const buttons = [
    'C', '(', ')', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '–',
    '1', '2', '3', '+',
    '0', '.', '=', 
  ];

  return (
    <div className="max-w-xs mx-auto bg-gray-100 rounded-lg shadow-lg p-4">
      {/* Tampilan Expression */}
      <div className="bg-white rounded-md p-2 text-right text-xl font-mono overflow-x-auto">
        {expression || '0'}
      </div>

      {/* Tampilan Hasil */}
      <div className="mt-2 bg-gray-200 rounded-md p-2 text-right text-2xl font-semibold font-mono">
        {result || ''}
      </div>

      {/* Grid Tombol */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleButtonClick(btn)}
            className={`
              bg-white 
              border 
              rounded 
              text-lg 
              font-medium 
              py-2 
              hover:bg-gray-200 
              focus:outline-none 
              transition
              ${
                // Highlight khusus untuk tombol operator
                ['+', '–', '×', '÷', '='].includes(btn)
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : ''
              }
              ${
                // Highlight khusus untuk tombol C (clear)
                btn === 'C'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : ''
              }
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
