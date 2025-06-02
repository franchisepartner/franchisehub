// components/Calculator.tsx
import { useState } from 'react';

export default function Calculator() {
  const [expression, setExpression] = useState<string>(''); // ekspresi matematika
  const [result, setResult] = useState<string>('0');       // hasil perhitungan

  // Menambahkan angka atau operator ke dalam expression
  const handleButtonClick = (val: string) => {
    setExpression((prev) => prev + val);
  };

  // Menghapus satu karakter terakhir
  const handleDelete = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  // Menghapus seluruh ekspresi dan result
  const handleClear = () => {
    setExpression('');
    setResult('0');
  };

  // Mengevaluasi ekspresi dan menghasilkan result
  const handleEvaluate = () => {
    try {
      // Gunakan eval dengan hati‐hati; di production lebih baik parse sendiri
      // Karena eval dapat berbahaya, asumsikan ini hanya kalkulator sederhana.
      // Untuk memastikan hanya angka dan operator, kita bisa validasi terlebih dahulu.
      // Misalnya hanya izinkan 0-9, + - * / ( ), ., dsb.
      // Namun di contoh ini kita langsung eval.
      // eslint-disable-next-line no-eval
      const evalResult = eval(expression || '0');
      setResult(String(evalResult));
    } catch {
      setResult('Error');
    }
  };

  return (
    <div className="w-full">
      {/* Display untuk hasil dan ekspresi */}
      <div className="bg-gray-100 rounded-t-lg p-4 mb-2">
        <div className="text-right text-sm text-gray-600">{expression || '0'}</div>
        <div className="text-right text-2xl font-semibold text-gray-800">{result}</div>
      </div>

      {/* Grid tombol kalkulator */}
      <div className="grid grid-cols-4 gap-1">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="py-4 bg-red-100 text-red-600 rounded-lg font-bold"
        >
          C
        </button>
        <button
          onClick={handleDelete}
          className="py-4 bg-yellow-100 text-yellow-600 rounded-lg font-bold"
        >
          ⌫
        </button>
        <button
          onClick={() => handleButtonClick('(')}
          className="py-4 bg-gray-200 text-gray-700 rounded-lg font-medium"
        >
          (
        </button>
        <button
          onClick={() => handleButtonClick(')')}
          className="py-4 bg-gray-200 text-gray-700 rounded-lg font-medium"
        >
          )
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleButtonClick('7')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          7
        </button>
        <button
          onClick={() => handleButtonClick('8')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          8
        </button>
        <button
          onClick={() => handleButtonClick('9')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          9
        </button>
        <button
          onClick={() => handleButtonClick('/')}
          className="py-4 bg-blue-100 text-blue-600 rounded-lg font-bold"
        >
          ÷
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleButtonClick('4')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          4
        </button>
        <button
          onClick={() => handleButtonClick('5')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          5
        </button>
        <button
          onClick={() => handleButtonClick('6')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          6
        </button>
        <button
          onClick={() => handleButtonClick('*')}
          className="py-4 bg-blue-100 text-blue-600 rounded-lg font-bold"
        >
          ×
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleButtonClick('1')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          1
        </button>
        <button
          onClick={() => handleButtonClick('2')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          2
        </button>
        <button
          onClick={() => handleButtonClick('3')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          3
        </button>
        <button
          onClick={() => handleButtonClick('-')}
          className="py-4 bg-blue-100 text-blue-600 rounded-lg font-bold"
        >
          −
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleButtonClick('0')}
          className="col-span-2 py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          0
        </button>
        <button
          onClick={() => handleButtonClick('.')}
          className="py-4 bg-white text-gray-800 rounded-lg font-medium"
        >
          .
        </button>
        <button
          onClick={() => handleButtonClick('+')}
          className="py-4 bg-blue-100 text-blue-600 rounded-lg font-bold"
        >
          +
        </button>

        {/* Tombol “=” (Evaluate) di kolom bawah */}
        <button
          onClick={handleEvaluate}
          className="col-span-4 mt-1 py-4 bg-green-500 text-white rounded-lg font-bold"
        >
          =
        </button>
      </div>
    </div>
  );
}
