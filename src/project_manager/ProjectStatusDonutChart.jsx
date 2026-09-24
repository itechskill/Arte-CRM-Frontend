import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLOR_MAP = {
  'In Progress': '#2563EB',
  'Planning': '#94A3B8',
  'Completed': '#10B981',
  'Review': '#8B5CF6',
  'On Hold': '#F59E0B',
  'Cancelled': '#EF4444'
};

export default function ProjectStatusDonutChart({ projects = [] }) {
  const statusData = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [{ name: 'No Projects', value: 1, color: '#E2E8F0' }];
    }
    const counts = {};
    projects.forEach(p => {
      const st = p.status || 'In Progress';
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: COLOR_MAP[key] || '#64748B'
    }));
  }, [projects]);

  return (
    <div className="chart-widget">
      <div className="chart-widget-header">
        <div>
          <h3 className="chart-widget-title">Project Status</h3>
          <p className="chart-widget-subtitle">Live real-time status distribution</p>
        </div>
      </div>

      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="status-legend">
        {statusData.map((entry) => (
          <div key={entry.name} className="status-legend-row">
            <div className="status-legend-left">
              <span className="status-legend-dot" style={{ backgroundColor: entry.color }}></span>
              <span className="status-legend-label">{entry.name}</span>
            </div>
            <span className="status-legend-value">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
