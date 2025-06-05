// components/BarChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface StatData {
  role: string;
  count: number;
}

const ROLE_LABELS: { [key: string]: string } = {
  administrator: 'Administrator',
  franchisor: 'Franchisor',
  franchisee: 'Franchisee',
  anonymous: 'Calon Franchisee/Anonymous',
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function CustomBarChart({ data }: { data: StatData[] }) {
  const formattedData = data.map((item) => ({
    label: ROLE_LABELS[item.role] || item.role,
    count: item.count,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={formattedData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count">
            {formattedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
