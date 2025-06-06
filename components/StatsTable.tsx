import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export function StatsTable({ contentId }: { contentId: string }) {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (!contentId) return;
    supabase.rpc('get_stats_for_content', { content_id: contentId }).then(({ data }) => {
      setStats(data || []);
    });
  }, [contentId]);

  if (!stats.length) return <div className="text-xs italic text-gray-400">Belum ada data kunjungan</div>;

  // Daftar role unik & tanggal unik (urutan terbaru)
  const roles = Array.from(new Set(stats.map(s => s.viewer_role)));
  const dates = Array.from(new Set(stats.map(s => s.date))).slice(-7).reverse();

  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-xs border border-gray-200 bg-gray-50 rounded">
        <thead>
          <tr>
            <th className="p-1 border border-gray-200 bg-gray-100">Tanggal</th>
            {roles.map(role => (
              <th className="p-1 border border-gray-200 bg-gray-100 capitalize" key={role}>{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map(date => (
            <tr key={date}>
              <td className="p-1 border border-gray-200">{date}</td>
              {roles.map(role => {
                const stat = stats.find(s => s.date === date && s.viewer_role === role);
                return (
                  <td className="p-1 border border-gray-200 text-center" key={role}>
                    {stat ? stat.visits : 0}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
