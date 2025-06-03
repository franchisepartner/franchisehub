import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Profile = {
  full_name: string
  is_admin: boolean
}
type Comment = {
  id: string
  content: string
  user_id: string
  thread_id: string
  created_at: string
  profiles?: Profile    // data profil user (nama & admin) via relasi
}
type Thread = {
  id: string
  title: string
  content: string
  image_url?: string
  user_id: string
  created_at: string
  profiles?: Profile    // data profil author (nama, is_admin jika perlu)
}

const ForumGlobalPage: NextPage = () => {
  const supabase = useSupabaseClient()
  const user = useUser()                        // data user yang sedang login
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)

  // State untuk form input
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadContent, setNewThreadContent] = useState('')
  const [newThreadFile, setNewThreadFile] = useState<File | null>(null)
  const [newCommentContent, setNewCommentContent] = useState('')

  // Refs untuk input file (opsional, bisa langsung pakai onChange)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch profil user saat ini (untuk cek is_admin)
  const fetchCurrentUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, is_admin')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('Error fetching user profile:', error.message)
    } else {
      setCurrentUserProfile({ full_name: data.full_name, is_admin: data.is_admin })
    }
  }

  // Fetch daftar semua thread
  const fetchThreads = async () => {
    setLoadingThreads(true)
    const { data, error } = await supabase
      .from('threads')
      .select(`
        id,
        title,
        content,
        image_url,
        user_id,
        created_at,
        profiles ( full_name )
      `) // mengambil nama penulis via relasi profiles
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching threads:', error.message)
    } else if (data) {
      setThreads(data as Thread[])
    }
    setLoadingThreads(false)
  }

  // Fetch komentar untuk thread tertentu (berdasarkan thread_id)
  const fetchComments = async (threadId: string) => {
    setLoadingComments(true)
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        user_id,
        thread_id,
        created_at,
        profiles ( full_name, is_admin )
      `) // mengambil nama & status admin komentator via relasi profiles
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Error fetching comments:', error.message)
    } else if (data) {
      setComments(data as Comment[])
    }
    setLoadingComments(false)
  }

  // Inisialisasi data awal setelah komponen mount atau user berubah
  useEffect(() => {
    if (user) {
      fetchCurrentUserProfile(user.id)  // dapatkan profil user login (nama & is_admin)
      fetchThreads()                    // ambil daftar thread
    } else {
      // jika tidak ada user (misal belum login), bisa handle di sini (misal redirect atau skip fetch)
      setThreads([])
      setSelectedThread(null)
      setComments([])
    }
  }, [user])

  // Polling opsional: refresh komentar setiap interval (contoh: 5 detik)
  useEffect(() => {
    if (selectedThread) {
      const intervalId = setInterval(() => {
        fetchComments(selectedThread.id)
      }, 5000)
      return () => clearInterval(intervalId)
    }
  }, [selectedThread])

  // Polling opsional: refresh daftar thread tiap interval (contoh: 30 detik)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchThreads()
    }, 30000)
    return () => clearInterval(intervalId)
  }, [])

  // Handler ketika memilih salah satu thread dari list
  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread)
    setComments([])               // reset komentar lama
    if (thread) {
      fetchComments(thread.id)    // load komentar untuk thread terpilih
    }
    setNewCommentContent('')      // reset input komentar
  }

  // Handler input file thread
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setNewThreadFile(file)
  }

  // Submit membuat thread baru
  const handleAddThread = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Silakan login terlebih dahulu.')
      return
    }
    if (!newThreadTitle.trim()) {
      alert('Judul thread tidak boleh kosong.')
      return
    }
    // Upload gambar ke Supabase Storage (jika ada file dipilih)
    let imageUrl: string | null = null
    if (newThreadFile) {
      const fileExt = newThreadFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`             // nama file unik: timestamp
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('forum-images')                                // ganti sesuai nama bucket
        .upload(fileName, newThreadFile)
      if (uploadError) {
        console.error('Upload image error:', uploadError.message)
        alert('Gagal mengupload gambar.')
        return
      }
      if (uploadData) {
        // dapatkan URL publik gambar
        const { data: publicData } = supabase
          .storage
          .from('forum-images')
          .getPublicUrl(uploadData.path)
        imageUrl = publicData.publicUrl
      }
    }
    // Insert thread baru ke database
    const { data: newThread, error } = await supabase
      .from('threads')
      .insert({
        title: newThreadTitle,
        content: newThreadContent,
        image_url: imageUrl,
        user_id: user.id,
        created_at: new Date().toISOString()  // atau biarkan default di DB
      })
      .select(`
        id,
        title,
        content,
        image_url,
        user_id,
        created_at,
        profiles ( full_name )
      `)
      .single()
    if (error) {
      console.error('Error inserting thread:', error.message)
      alert('Gagal membuat thread baru.')
    } else if (newThread) {
      // Update daftar threads di state dengan thread baru
      setThreads(prev => [newThread as Thread, ...prev])
      // Reset form input
      setNewThreadTitle('')
      setNewThreadContent('')
      setNewThreadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Submit menambahkan komentar baru ke thread terpilih
  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedThread) {
      return alert('Harus login dan memilih thread untuk mengirim komentar.')
    }
    if (!newCommentContent.trim()) {
      return // jika komentar kosong, tidak melakukan apa-apa
    }
    // Insert komentar ke database
    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert({
        content: newCommentContent,
        thread_id: selectedThread.id,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        content,
        user_id,
        thread_id,
        created_at,
        profiles ( full_name, is_admin )
      `)
      .single()
    if (error) {
      console.error('Error inserting comment:', error.message)
      alert('Gagal mengirim komentar.')
    } else if (insertedComment) {
      // Tambahkan komentar baru ke state (langsung muncul)
      setComments(prev => [...prev, insertedComment as Comment])
      setNewCommentContent('')  // reset input komentar
    }
  }

  // Hapus thread (jika user adalah author atau admin)
  const handleDeleteThread = async (thread: Thread) => {
    if (!user || !currentUserProfile) return
    const isOwner = thread.user_id === user.id
    const isAdmin = currentUserProfile.is_admin
    if (!isOwner && !isAdmin) {
      return alert('Anda tidak memiliki izin untuk menghapus thread ini.')
    }
    const confirm = window.confirm(`Yakin ingin menghapus thread "${thread.title}" beserta komentarnya?`)
    if (!confirm) return
    // Hapus thread dari DB (komentar terhubung akan terhapus otomatis jika FK cascade)
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', thread.id)
    if (error) {
      console.error('Error deleting thread:', error.message)
      alert('Gagal menghapus thread.')
    } else {
      // Update state: hapus thread dari daftar
      setThreads(prev => prev.filter(t => t.id !== thread.id))
      // Jika thread yang dihapus sedang ditampilkan, reset tampilan
      if (selectedThread && selectedThread.id === thread.id) {
        setSelectedThread(null)
        setComments([])
      }
    }
  }

  // Hapus komentar (jika user adalah author atau admin)
  const handleDeleteComment = async (comment: Comment) => {
    if (!user || !currentUserProfile) return
    const isOwner = comment.user_id === user.id
    const isAdmin = currentUserProfile.is_admin
    if (!isOwner && !isAdmin) {
      return alert('Anda tidak memiliki izin untuk menghapus komentar ini.')
    }
    const confirm = window.confirm('Yakin ingin menghapus komentar ini?')
    if (!confirm) return
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id)
    if (error) {
      console.error('Error deleting comment:', error.message)
      alert('Gagal menghapus komentar.')
    } else {
      // Update state: hapus komentar dari list
      setComments(prev => prev.filter(c => c.id !== comment.id))
    }
  }

  return (
    <div className="forum-page-container" style={{ padding: '1rem' }}>
      <h1>Forum Global</h1>

      {/* Daftar Threads */}
      <div className="threads-section" style={{ marginBottom: '2rem' }}>
        <h2>Daftar Thread</h2>
        {loadingThreads ? (
          <p>Loading threads...</p>
        ) : (
          <ul>
            {threads.map(thread => (
              <li 
                key={thread.id} 
                onClick={() => handleSelectThread(thread)} 
                style={{ cursor: 'pointer', marginBottom: '0.5rem', listStyle: 'none' }}
              >
                <strong>{thread.title}</strong>
                {thread.profiles?.full_name && (
                  <span> – oleh {thread.profiles.full_name}</span>
                )}
                {/* Tampilkan tanggal atau info lain jika perlu */}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail Thread & Komentar */}
      <div className="thread-detail-section" style={{ marginBottom: '2rem' }}>
        {selectedThread ? (
          <div>
            <h2>{selectedThread.title}</h2>
            {selectedThread.profiles?.full_name && (
              <p>
                <em>oleh {selectedThread.profiles.full_name}{selectedThread.user_id === user?.id ? " (Anda)" : ""}{currentUserProfile?.is_admin && selectedThread.user_id === user?.id ? " - Admin" : ""}</em>
              </p>
            )}
            {selectedThread.content && <p>{selectedThread.content}</p>}
            {selectedThread.image_url && (
              <div style={{ margin: '1rem 0' }}>
                <img src={selectedThread.image_url} alt="Thread Image" style={{ maxWidth: '100%' }} />
              </div>
            )}
            {/* Tombol hapus thread (jika diizinkan) */}
            {(user && currentUserProfile && (selectedThread.user_id === user.id || currentUserProfile.is_admin)) && (
              <button onClick={() => handleDeleteThread(selectedThread)}>
                Hapus Thread
              </button>
            )}

            <h3>Komentar:</h3>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : (
              <ul>
                {comments.map(comment => (
                  <li key={comment.id} style={{ marginBottom: '1rem', listStyle: 'none' }}>
                    <p>{comment.content}</p>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>
                      – <strong>{comment.profiles?.full_name || "User"}</strong>{comment.profiles?.is_admin ? " (Admin)" : ""} 
                      {comment.user_id === user?.id ? " (Anda)" : ""}
                      {' '}<em>{new Date(comment.created_at).toLocaleString()}</em>
                    </p>
                    {/* Tombol hapus komentar (jika diizinkan) */}
                    {(user && currentUserProfile && (comment.user_id === user.id || currentUserProfile.is_admin)) && (
                      <button onClick={() => handleDeleteComment(comment)} style={{ fontSize: '0.8rem' }}>
                        Hapus
                      </button>
                    )}
                  </li>
                ))}
                {comments.length === 0 && <li>Tidak ada komentar.</li>}
              </ul>
            )}

            {/* Form tambah komentar baru */}
            {user ? (
              <form onSubmit={handleAddComment}>
                <textarea 
                  value={newCommentContent} 
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Tulis komentar..." 
                  rows={3} required 
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                <br />
                <button type="submit">Kirim Komentar</button>
              </form>
            ) : (
              <p><em>Silakan login untuk mengirim komentar.</em></p>
            )}
          </div>
        ) : (
          <p>Pilih salah satu thread untuk melihat detail dan komentar.</p>
        )}
      </div>

      {/* Formulir Buat Thread Baru */}
      {user ? (
        <div className="new-thread-form">
          <h2>Buat Thread Baru</h2>
          <form onSubmit={handleAddThread}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Judul thread" 
                value={newThreadTitle} 
                onChange={(e) => setNewThreadTitle(e.target.value)} 
                required 
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <textarea 
                placeholder="Konten thread (opsional)" 
                value={newThreadContent} 
                onChange={(e) => setNewThreadContent(e.target.value)} 
                rows={4} 
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
              /> (opsional)
            </div>
            <button type="submit">Posting Thread</button>
          </form>
        </div>
      ) : (
        <p><em>Silakan login untuk membuat thread baru.</em></p>
      )}
    </div>
  )
}

export default ForumGlobalPage
