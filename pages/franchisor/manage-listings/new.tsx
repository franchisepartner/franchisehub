// pages/franchisor/manage-listings/new.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'

export default function NewFranchiseListing() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Tambah Listing Franchise Baru</h1>
      <form className="space-y-5">
        <div>
          <label className="block font-semibold">Nama Franchise</label>
          <input type="text" className="w-full border p-2 rounded"/>
        </div>

        <div>
          <label className="block font-semibold">Deskripsi Franchise</label>
          <textarea className="w-full border p-2 rounded" rows={2}/>
        </div>

        <div>
          <label className="block font-semibold">Investasi Minimum (Rp)</label>
          <input type="number" className="w-full border p-2 rounded"/>
        </div>

        <div>
          <label className="block font-semibold">Mode Operasi</label>
          <select className="w-full border p-2 rounded">
            <option>Autopilot</option>
            <option>Semi Autopilot</option>
          </select>
          <p className="text-sm italic text-gray-600">
            <strong>Autopilot</strong>: Bisnis berjalan otomatis sepenuhnya tanpa keterlibatan pemilik harian.<br/>
            <strong>Semi Autopilot</strong>: Bisnis berjalan otomatis sebagian, namun membutuhkan keterlibatan ringan dari pemilik.
          </p>
        </div>

        <div>
          <label className="block font-semibold">Lokasi Franchise</label>
          <input type="text" className="w-full border p-2 rounded"/>
        </div>

        <div>
          <label className="block font-semibold">Kategori Franchise</label>
          <select className="w-full border p-2 rounded">
            <option>F&B</option>
            <option>Retail</option>
            <option>Jasa</option>
            <option>Kesehatan & Kecantikan</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Kontak WhatsApp Franchise</label>
          <input type="text" className="w-full border p-2 rounded"/>
        </div>

        <div>
          <label className="block font-semibold">Kontak Email Franchise</label>
          <input type="email" className="w-full border p-2 rounded"/>
        </div>

        <div>
          <label className="block font-semibold">Website Franchise (opsional)</label>
          <input type="text" className="w-full border p-2 rounded"/>
        </div>

        <div>
          <label className="block font-semibold">Slug URL (otomatis)</label>
          <input type="text" className="w-full border p-2 rounded bg-gray-100" disabled/>
        </div>

        <div>
          <label className="block font-semibold">Logo Franchise (logo icon kecil)</label>
          <input type="file" className="block mt-2"/>
        </div>

        <div>
          <label className="block font-semibold">Cover Franchise (gambar banner utama)</label>
          <input type="file" className="block mt-2"/>
        </div>

        <div>
          <label className="block font-semibold">Dokumen Hukum Franchise</label>
          <input type="checkbox" id="dokumenHukum"/>
          <label htmlFor="dokumenHukum" className="ml-2">Sudah Punya Dokumen Hukum</label>
          
          <div className="ml-6 mt-2">
            <label className="block"><input type="checkbox"/> STPW (Surat Tanda Pendaftaran Waralaba)</label>
            <label className="block"><input type="checkbox"/> Perjanjian Waralaba</label>
            <label className="block"><input type="checkbox"/> SIUP (Surat Izin Usaha Perdagangan)</label>
            <label className="block"><input type="checkbox"/> SITU (Surat Izin Tempat Usaha)</label>
            <label className="block"><input type="checkbox"/> Akta Pendirian Usaha</label>
          </div>
        </div>

        <div>
          <label className="block font-semibold">Catatan Tambahan (opsional)</label>
          <textarea className="w-full border p-2 rounded" rows={2}/>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Tambah Listing
        </button>
      </form>
    </div>
  )
}
