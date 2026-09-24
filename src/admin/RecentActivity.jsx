import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, Shield, User, DollarSign, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import './RecentActivity.css';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function RecentActivity({ onViewAll }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAudit = async () => {
      try {
        const { response, data } = await apiRequest('/api/audit-logs');
        if (response.ok && data.success && Array.isArray(data.data)) {
          const logs = data.data.slice(0, 8).map((log, idx) => {
            const userName = log.performedByName || (log.performedBy ? log.performedBy.fullName : 'System');
            const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SY';
            const timeAgo = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              id: log._id || idx,
              name: userName,
              initials,
              bg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
              action: log.action || 'Performed action',
              target: log.details || log.targetUserName || '',
              time: timeAgo
            };
          });
          setActivities(logs);
        }
      } catch (err) {
        console.error('Fetch audit logs for recent activity error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAudit();
  }, []);

  return (
    <div className="widget-card" style={{ height: '340px' }}>
      <div className="widget-header">
        <div className="widget-title-group">
          <h3>Recent System Activity</h3>
          <p>Live audit trail & operations log from MongoDB</p>
        </div>
        <button 
          onClick={onViewAll}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#2563EB',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="activity-list" style={{ overflowY: 'auto', paddingRight: '4px', maxHeight: '240px' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            Loading live activity...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="activity-item">
              <div className="activity-avatar" style={{ backgroundColor: act.bg }}>
                {act.initials}
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>{act.name}</strong> — {act.target || act.action}
                </div>
                <div className="activity-time">{act.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
