import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AdminStats } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
      setIsLoading(false);
    };
    loadStats();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Clubs', value: stats?.totalClubs || 0, icon: '📚', color: 'bg-green-500' },
    { label: 'Total Messages', value: stats?.totalMessages || 0, icon: '💬', color: 'bg-purple-500' },
    { label: 'Reported Messages', value: stats?.reportedMessages || 0, icon: '⚠️', color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
