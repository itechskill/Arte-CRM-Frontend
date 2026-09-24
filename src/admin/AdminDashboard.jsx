import React, { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import RevenueChart from './RevenueChart';
import PipelineDonutChart from './PipelineDonutChart';
import DealsOverviewChart from './DealsOverviewChart';
import RecentActivity from './RecentActivity';
import { Users, ShieldCheck, UserX } from 'lucide-react';
import { apiRequest } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard({ onViewAllClients }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const { response, data } = await apiRequest('/api/admin/directory');
        if (response.ok && data.success && Array.isArray(data.data)) {
          const allUsers = data.data;
          const active = allUsers.filter(u => u.status === 'active').length;
          const inactive = allUsers.filter(u => u.status !== 'active').length;
          setStats({
            totalUsers: allUsers.length,
            activeUsers: active,
            inactiveUsers: inactive
          });
        }
      } catch (err) {
        console.error('Fetch admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="admin-dashboard-container">
      {/* Top Admin KPI Cards */}
      <div className="admin-kpi-grid">
        <KpiCard 
          title="Total Users"
          value={loading ? '...' : String(stats.totalUsers)}
          change="Real-Time"
          isPositive={true}
          subtext="Registered accounts in DB"
          icon={Users}
          colorTheme="blue"
        />
        <KpiCard 
          title="Active Users"
          value={loading ? '...' : String(stats.activeUsers)}
          change="Approved"
          isPositive={true}
          subtext="Active accounts"
          icon={ShieldCheck}
          colorTheme="green"
        />
        <KpiCard 
          title="Inactive / Pending"
          value={loading ? '...' : String(stats.inactiveUsers)}
          change={stats.inactiveUsers > 0 ? "Action Needed" : "All Clear"}
          isPositive={stats.inactiveUsers === 0}
          subtext="Pending approvals"
          icon={UserX}
          colorTheme="purple"
        />
      </div>

      {/* Admin Revenue & Pipeline Charts */}
      <div className="admin-analytics-grid">
        <RevenueChart />
        <PipelineDonutChart />
      </div>

      {/* Admin Bottom Grid */}
      <div className="admin-bottom-grid">
        <DealsOverviewChart />
        <RecentActivity onViewAll={onViewAllClients} />
      </div>
    </div>
  );
}
