interface StatsCardsProps {
  newToday: number;
  pendingConfirmation: number;
  thisWeek: number;
  thisMonth: number;
}

export default function StatsCards({
  newToday,
  pendingConfirmation,
  thisWeek,
  thisMonth,
}: StatsCardsProps) {
  const stats = [
    { label: 'Đơn mới hôm nay', value: newToday, icon: '📅' },
    { label: 'Chờ xác nhận', value: pendingConfirmation, icon: '⏳' },
    { label: 'Đơn trong tuần', value: thisWeek, icon: '📈' },
    { label: 'Đơn trong tháng', value: thisMonth, icon: '🏆' },
  ];

  return (
    <div className="stats-grid" style={{ marginBottom: '32px' }}>
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-card">
          <div className="stat-card-label">{stat.label}</div>
          <div className="stat-card-value">{stat.value}</div>
          <div className="stat-card-icon">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
}
