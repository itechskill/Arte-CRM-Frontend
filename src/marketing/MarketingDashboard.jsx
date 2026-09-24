import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Megaphone,
  Target,
  Share2,
  TrendingUp,
  ArrowUpRight,
  Users,
  DollarSign,
  PieChart,
  Plus,
  Zap,
  Eye,
  BarChart3,
  Award,
  Briefcase
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import './MarketingDashboard.css';
import './MarketingViews.css';

export default function MarketingDashboard({ currentUser, onNavigateTab, onOpenCampaignModal, onOpenLeadModal }) {
  const [summary, setSummary] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketingData = async () => {
    try {
      const [sumRes, taskRes] = await Promise.all([
        apiRequest('/api/campaigns/summary'),
        apiRequest('/api/tasks')
      ]);

      if (sumRes.response.ok && sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (taskRes.response.ok && taskRes.data.success && Array.isArray(taskRes.data.data)) {
        setAssignedTasks(taskRes.data.data);
      }
    } catch (err) {
      console.error('Fetch marketing dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#0F172A',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          fontSize: '0.82rem',
          border: '1px solid #334155'
        }}>
          <p style={{ fontWeight: 700, marginBottom: '6px', color: '#94A3B8' }}>{label} Lead Metrics</p>
          <p style={{ color: '#2563EB', fontWeight: 600 }}>
            MQLs: {payload[0]?.value}
          </p>
          <p style={{ color: '#8B5CF6', fontWeight: 600, marginTop: '2px' }}>
            SQLs: {payload[1]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'there';
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const leadTrendData = summary?.leadTrendData || [];
  const channelShare = summary?.channelShare || [];
  const topCampaigns = summary?.topCampaigns || [];

  return (
    <div className="mkt-dashboard mkt-view-container">
      {/* Welcome Banner */}
      <div className="mkt-welcome-banner">
        <div className="mkt-welcome-left">
          <h2>Good morning, {firstName}! 🚀</h2>
          <p>Live real-time marketing performance overview — {todayFormatted}</p>
        </div>
        <div className="mkt-welcome-stats">
          <div className="mkt-welcome-stat">
            <span className="mkt-welcome-stat-value">{summary?.totalLeads ?? 0}</span>
            <span className="mkt-welcome-stat-label">Total Leads</span>
          </div>
          <div className="mkt-welcome-stat">
            <span className="mkt-welcome-stat-value">{summary?.activeCampaigns ?? 0}</span>
            <span className="mkt-welcome-stat-label">Active Campaigns</span>
          </div>
          <div className="mkt-welcome-stat">
            <span className="mkt-welcome-stat-value">{summary?.conversionRate ?? '0%'}</span>
            <span className="mkt-welcome-stat-label">Conversion Rate</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="mkt-quick-actions">
        <div className="mkt-action-card" onClick={onOpenCampaignModal}>
          <div className="mkt-action-icon" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
            <Megaphone size={20} />
          </div>
          <div className="mkt-action-info">
            <span className="mkt-action-title">Create Campaign</span>
            <span className="mkt-action-desc">Launch ad or email sprint</span>
          </div>
        </div>

        <div className="mkt-action-card" onClick={onOpenLeadModal}>
          <div className="mkt-action-icon" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
            <Target size={20} />
          </div>
          <div className="mkt-action-info">
            <span className="mkt-action-title">Add Lead (MQL)</span>
            <span className="mkt-action-desc">Record prospect contact</span>
          </div>
        </div>

        <div className="mkt-action-card" onClick={() => onNavigateTab('content')}>
          <div className="mkt-action-icon" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
            <Share2 size={20} />
          </div>
          <div className="mkt-action-info">
            <span className="mkt-action-title">Schedule Post</span>
            <span className="mkt-action-desc">Publish social media content</span>
          </div>
        </div>

        <div className="mkt-action-card" onClick={() => onNavigateTab('analytics')}>
          <div className="mkt-action-icon" style={{ backgroundColor: '#DCFCE7', color: '#059669' }}>
            <BarChart3 size={20} />
          </div>
          <div className="mkt-action-info">
            <span className="mkt-action-title">Marketing Analytics</span>
            <span className="mkt-action-desc">Inspect traffic & funnels</span>
          </div>
        </div>
      </div>

      {/* CEO Directives & Department Tasks Section */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Briefcase size={20} color="#2563EB" />
          <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.05rem', fontWeight: 700 }}>
            CEO Directives & Department Tasks ({assignedTasks.length})
          </h3>
        </div>
        {assignedTasks.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {assignedTasks.map((t) => (
              <div key={t._id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{t.title}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px', background: t.priority === 'Urgent' || t.priority === 'High' ? '#FEE2E2' : '#E0E7FF', color: t.priority === 'Urgent' || t.priority === 'High' ? '#B91C1C' : '#3730A3', fontWeight: 700 }}>
                    {t.priority}
                  </span>
                </div>
                {t.description && (
                  <p style={{ color: '#475569', fontSize: '0.8rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B', paddingTop: '6px', borderTop: '1px dashed #CBD5E1' }}>
                  <span>By: <strong>{t.assignedByName || 'Management'}</strong></span>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#1E293B', fontWeight: 600 }}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '0.85rem' }}>
            No tasks currently assigned to Marketing department.
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="mkt-kpi-grid">
        <div className="mkt-kpi-card">
          <div className="mkt-kpi-top">
            <span className="mkt-kpi-title">Total Leads (MQLs)</span>
            <div className="mkt-kpi-icon pink"><Target size={18} /></div>
          </div>
          <div className="mkt-kpi-value">{summary?.totalLeads ?? 0}</div>
          <div className="mkt-kpi-subtitle up">
            <ArrowUpRight size={14} /> Live database records
          </div>
        </div>

        <div className="mkt-kpi-card">
          <div className="mkt-kpi-top">
            <span className="mkt-kpi-title">Active Campaigns</span>
            <div className="mkt-kpi-icon purple"><Megaphone size={18} /></div>
          </div>
          <div className="mkt-kpi-value">{summary?.activeCampaigns ?? 0}</div>
          <div className="mkt-kpi-subtitle">{summary?.totalCampaigns ?? 0} total campaigns</div>
        </div>

        <div className="mkt-kpi-card">
          <div className="mkt-kpi-top">
            <span className="mkt-kpi-title">Total Campaign Budget</span>
            <div className="mkt-kpi-icon blue"><DollarSign size={18} /></div>
          </div>
          <div className="mkt-kpi-value">${Number(summary?.totalBudget || 0).toLocaleString()}</div>
          <div className="mkt-kpi-subtitle up">
            <ArrowUpRight size={14} /> Allocated ad spend
          </div>
        </div>

        <div className="mkt-kpi-card">
          <div className="mkt-kpi-top">
            <span className="mkt-kpi-title">Total Audience Reach</span>
            <div className="mkt-kpi-icon emerald"><Award size={18} /></div>
          </div>
          <div className="mkt-kpi-value">{Number(summary?.totalReach || 0).toLocaleString()}</div>
          <div className="mkt-kpi-subtitle up">Aggregated impressions</div>
        </div>
      </div>

      {/* Financial & Lead Charts Grid */}
      <div className="mkt-charts-grid">
        {/* Lead Trend Area Chart */}
        <div className="mkt-chart-card">
          <div className="mkt-chart-header">
            <div className="mkt-chart-title-group">
              <h3>Lead Acquisition & Qualification Trend</h3>
              <p>Monthly MQL and SQL trajectory from MongoDB</p>
            </div>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMql" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSql" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="mqls" name="Marketing Qualified (MQL)" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMql)" />
                <Area type="monotone" dataKey="sqls" name="Sales Qualified (SQL)" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorSql)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="mkt-chart-card">
          <div className="mkt-chart-header">
            <div className="mkt-chart-title-group">
              <h3>Acquisition by Channel</h3>
              <p>Real-time MQL generating acquisition channels</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {channelShare.length === 0 && (
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No leads tracked by channel yet.</p>
            )}
            {channelShare.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{cat.channel}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{cat.mqls} Leads ({cat.pct})</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: cat.pct,
                      backgroundColor: idx === 0 ? '#EC4899' : idx === 1 ? '#8B5CF6' : idx === 2 ? '#2563EB' : idx === 3 ? '#F59E0B' : '#10B981',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Active Campaigns Table */}
      <div className="mkt-card">
        <div className="mkt-card-header">
          <div>
            <h3 className="mkt-card-title">Top Marketing Campaigns ({topCampaigns.length})</h3>
            <p className="mkt-card-desc">Live campaign metrics, ad expenditure, and conversion yields</p>
          </div>
          <button className="mkt-btn-secondary" onClick={() => onNavigateTab('campaigns')}>
            View All Campaigns
          </button>
        </div>

        <div className="mkt-table-wrapper">
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Channel / Type</th>
                <th>Budget</th>
                <th>Audience Reach</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>No campaigns found in database.</td>
                </tr>
              )}
              {topCampaigns.map((cmp) => (
                <tr key={cmp._id || cmp.id}>
                  <td style={{ fontWeight: 600, color: '#1E293B' }}>{cmp.name}</td>
                  <td><span className="mkt-badge draft">{cmp.type || cmp.channel || 'Digital'}</span></td>
                  <td style={{ fontWeight: 600 }}>${Number(cmp.budget || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{Number(cmp.reach || 0).toLocaleString()}</td>
                  <td>
                    <span className={`mkt-badge ${(cmp.status || 'Active').toLowerCase()}`}>
                      {cmp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
