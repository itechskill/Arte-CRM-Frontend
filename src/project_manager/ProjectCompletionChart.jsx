import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function DotShape(props) {
  const { cx, cy } = props;
  return (
    <circle cx={cx} cy={cy} r={5} fill="#FFFFFF" stroke="#2563EB" strokeWidth={2.5} />
  );
}

export default function ProjectCompletionTrend({ projects = [] }) {
  const trendData = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [
        { month: 'Start', rate: 0 },
        { month: 'Mid', rate: 50 },
        { month: 'Current', rate: 80 }
      ];
    }
    // Calculate average completion rate and milestone progress
    const sorted = [...projects].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    return sorted.map((p, idx) => ({
      month: p.name?.length > 10 ? p.name.slice(0, 10) + '...' : (p.name || `P${idx + 1}`),
      rate: p.status === 'Completed' ? 100 : (p.status === 'Review' ? 85 : (p.status === 'In Progress' ? (p.progress || 60) : 25))
    }));
  }, [projects]);

  const avgRate = useMemo(() => {
    if (!projects.length) return 0;
    const total = projects.reduce((sum, p) => sum + (p.status === 'Completed' ? 100 : (p.progress || (p.status === 'In Progress' ? 60 : 25))), 0);
    return Math.round(total / projects.length);
  }, [projects]);

  return (
    <div className="chart-widget chart-widget-wide">
      <div className="chart-widget-header">
        <div>
          <h3 className="chart-widget-title">Project Completion Rates</h3>
          <p className="chart-widget-subtitle">Live real-time completion tracking per project</p>
        </div>
        <span className="growth-pill">{avgRate}% Avg</span>
      </div>

      <div style={{ width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(val) => [`${val}%`, 'Completion']}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#completionGradient)"
              dot={<DotShape />}
              activeDot={{ r: 6, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
