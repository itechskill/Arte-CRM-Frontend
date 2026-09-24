import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Package, FileText, UserPlus, Building2, ClipboardList, TrendingUp } from 'lucide-react';
import { apiRequest } from '../utils/api';
import './AdministrationDashboard.css';

const quickActions = [
  {
    id: 'employees',
    title: 'Add Employee',
    desc: 'Onboard a new team member',
    icon: UserPlus,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'departments',
    title: 'Manage Departments',
    desc: 'Structure teams and reporting',
    icon: Building2,
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
  },
  {
    id: 'attendance_leave',
    title: 'Review Leave',
    desc: 'Approve pending requests',
    icon: ClipboardList,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'reports',
    title: 'View Reports',
    desc: 'Inspect org-wide metrics',
    icon: TrendingUp,
    iconBg: '#ECFDF5',
    iconColor: '#16A34A',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdministrationDashboard({ currentUser, onNavigateTab }) {
  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'there';
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departmentsCount: 0,
    pendingLeaves: 0,
    presentToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashData = async () => {
      try {
        const [hrStatsRes, dirRes, leaveRes] = await Promise.all([
          apiRequest('/api/hr/stats'),
          apiRequest('/api/admin/directory'),
          apiRequest('/api/hr/leaves')
        ]);

        let empCount = 0;
        let deptCount = 0;
        let pendingL = 0;
        let present = 0;

        if (hrStatsRes.response.ok && hrStatsRes.data.success) {
          present = hrStatsRes.data.data.presentToday || 0;
          pendingL = hrStatsRes.data.data.pendingLeavesCount || 0;
        }

        if (dirRes.response.ok && dirRes.data.success && Array.isArray(dirRes.data.data)) {
          const allUsers = dirRes.data.data;
          empCount = allUsers.length;
          const depts = new Set(allUsers.map(u => u.department).filter(Boolean));
          deptCount = depts.size || 1;
        }

        if (leaveRes.response.ok && leaveRes.data.success && Array.isArray(leaveRes.data.data)) {
          pendingL = leaveRes.data.data.filter(l => l.status === 'Pending').length;
        }

        setStats({
          totalEmployees: empCount,
          departmentsCount: deptCount,
          pendingLeaves: pendingL,
          presentToday: present
        });
      } catch (err) {
        console.error('Fetch administration dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashData();
  }, []);

  const kpiCards = [
    {
      id: 1,
      label: 'TOTAL EMPLOYEES',
      value: loading ? '...' : String(stats.totalEmployees),
      icon: Users,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 2,
      label: 'DEPARTMENTS',
      value: loading ? '...' : String(stats.departmentsCount),
      icon: Building2,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
    },
    {
      id: 3,
      label: 'PENDING LEAVE',
      value: loading ? '...' : String(stats.pendingLeaves),
      icon: CalendarCheck,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      id: 4,
      label: 'PRESENT TODAY',
      value: loading ? '...' : String(stats.presentToday),
      icon: FileText,
      iconBg: '#ECFDF5',
      iconColor: '#16A34A',
    },
  ];

  return (
    <div className="admin-side-dashboard-container">
      {/* Welcome Banner */}
      <div className="admin-side-welcome-banner">
        <div>
          <h1 className="admin-side-banner-greeting">{getGreeting()}, {firstName}! 👋</h1>
          <p className="admin-side-banner-subtitle">
            Here's your administration overview for today — {getFormattedDate()} (Live DB)
          </p>
        </div>

        <div className="admin-side-banner-stats">
          <div className="admin-side-banner-stat">
            <span className="admin-side-banner-stat-value">{loading ? '...' : stats.totalEmployees}</span>
            <span className="admin-side-banner-stat-label">Total Employees</span>
          </div>
          <div className="admin-side-banner-stat">
            <span className="admin-side-banner-stat-value">{loading ? '...' : stats.departmentsCount}</span>
            <span className="admin-side-banner-stat-label">Departments</span>
          </div>
          <div className="admin-side-banner-stat">
            <span className="admin-side-banner-stat-value">{loading ? '...' : stats.pendingLeaves}</span>
            <span className="admin-side-banner-stat-label">Pending Approvals</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-side-quick-actions-grid">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className="admin-side-quick-action-card"
              onClick={() => onNavigateTab && onNavigateTab(action.id)}
            >
              <div className="admin-side-quick-action-icon" style={{ backgroundColor: action.iconBg, color: action.iconColor }}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="admin-side-quick-action-title">{action.title}</h3>
                <p className="admin-side-quick-action-desc">{action.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Row */}
      <div className="admin-side-kpi-grid">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className="admin-side-kpi-card">
              <div className="admin-side-kpi-header">
                <span className="admin-side-kpi-title">{kpi.label}</span>
                <div className="admin-side-kpi-icon" style={{ backgroundColor: kpi.iconBg, color: kpi.iconColor }}>
                  <Icon size={18} />
                </div>
              </div>
              <span className="admin-side-kpi-value">{kpi.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
