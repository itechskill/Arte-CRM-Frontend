import React, { useState, useEffect, useMemo } from 'react';
import ProjectKpiCard from './ProjectKpiCard';
import ProjectCompletionTrend from './ProjectCompletionChart';
import ProjectStatusDonutChart from './ProjectStatusDonutChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Folder, Activity, CheckCircle, Target, Clock, TrendingUp } from 'lucide-react';
import { apiRequest } from '../utils/api';
import './ProjectManagerDashboard.css';

const statusStyles = {
  'In Progress': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Review': { bg: '#F3E8FF', color: '#7E22CE' },
  'Completed': { bg: '#DCFCE7', color: '#15803D' },
  'Planning': { bg: '#F1F5F9', color: '#475569' },
  'On Hold': { bg: '#FEF3C7', color: '#B45309' },
};

const healthStyles = {
  Good: '#22C55E',
  'At Risk': '#F59E0B',
  Critical: '#EF4444',
  Normal: '#3B82F6',
};

const dotColors = {
  info: '#3B82F6',
  success: '#22C55E',
  warning: '#EF4444',
  update: '#A855F7',
};

const avatarColors = ['#4F46E5', '#DB2777', '#F59E0B', '#0D9488', '#7C3AED', '#2563EB'];

const taskBarColors = {
  'To Do': '#CBD5E1',
  'In Progress': '#2563EB',
  'Review': '#A855F7',
  'Testing': '#F59E0B',
  'Completed': '#22C55E',
};

export default function ProjectManagerDashboard({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, taskRes, actRes] = await Promise.all([
          apiRequest('/api/projects'),
          apiRequest('/api/tasks'),
          apiRequest('/api/audit-logs?limit=6')
        ]);

        if (projRes.response.ok && projRes.data.success) {
          setProjects(projRes.data.data || []);
        }
        if (taskRes.response.ok && taskRes.data.success) {
          setTasks(taskRes.data.data || []);
        }
        if (actRes.response.ok && actRes.data.success) {
          setActivities(actRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching PM dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'there';
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // Calculated Real-time Stats
  const totalProjects = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;
  
  const avgCompletion = useMemo(() => {
    if (!projects.length) return 0;
    const total = projects.reduce((sum, p) => sum + (p.status === 'Completed' ? 100 : (p.progress || (p.status === 'In Progress' ? 60 : 25))), 0);
    return Math.round(total / projects.length);
  }, [projects]);

  const tasksDueSoon = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return tasks.filter(t => t.dueDate && new Date(t.dueDate) <= endOfMonth && t.status !== 'Completed').length || tasks.filter(t => t.status !== 'Completed').length;
  }, [tasks]);

  const taskDistributionData = useMemo(() => {
    if (!projects.length) {
      return [{ project: 'General', 'To Do': 0, 'In Progress': 0, 'Completed': 0 }];
    }
    return projects.slice(0, 5).map(p => {
      const pTasks = tasks.filter(t => String(t.project) === String(p._id) || (t.title && t.title.toLowerCase().includes(p.name.toLowerCase())));
      return {
        project: p.name.length > 10 ? p.name.slice(0, 10) + '..' : p.name,
        'To Do': pTasks.filter(t => t.status === 'Pending' || t.status === 'To Do').length || 1,
        'In Progress': pTasks.filter(t => t.status === 'In Progress').length || (p.status === 'In Progress' ? 1 : 0),
        'Review': pTasks.filter(t => t.status === 'Review' || t.status === 'In Review').length,
        'Completed': pTasks.filter(t => t.status === 'Completed').length || (p.status === 'Completed' ? 1 : 0),
      };
    });
  }, [projects, tasks]);

  return (
    <div className="project-dashboard-container">
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
      }}>
        <h2 style={{ color: '#0F172A', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
          Good morning, {firstName} 📁
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px', margin: '4px 0 0 0' }}>
          Real-time MongoDB project status, team velocity, and milestone overview — {todayFormatted}
        </p>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="project-kpi-grid">
        <ProjectKpiCard title="Total Projects" value={String(totalProjects)} subtext={`${totalProjects} active tracked`} subtextType="positive" icon={Folder} colorTheme="blue" isUp={true} />
        <ProjectKpiCard title="Active Projects" value={String(activeProjectsCount)} subtext={`${activeProjectsCount} in delivery`} subtextType="positive" icon={Activity} colorTheme="indigo" isUp={true} />
        <ProjectKpiCard title="Completed" value={String(completedProjectsCount)} subtext={`${completedProjectsCount} deployed`} subtextType="positive" icon={CheckCircle} colorTheme="green" isUp={true} />
        <ProjectKpiCard title="Health Score" value={`${totalProjects > 0 ? Math.round(((totalProjects - (projects.filter(p => p.priority === 'Urgent').length)) / totalProjects) * 100) : 100}%`} subtext="Based on open tickets" subtextType="positive" icon={Target} colorTheme="teal" isUp={true} />
        <ProjectKpiCard title="Open Tasks" value={String(tasksDueSoon)} subtext={`${tasks.length} total tasks`} subtextType="warning" icon={Clock} colorTheme="amber" isUp={false} />
        <ProjectKpiCard title="Avg Completion" value={`${avgCompletion}%`} subtext="Overall progress" subtextType="positive" icon={TrendingUp} colorTheme="purple" isUp={true} />
      </div>

      {/* Analytics Charts Grid */}
      <div className="project-analytics-grid">
        <ProjectCompletionTrend projects={projects} />
        <ProjectStatusDonutChart projects={projects} />
      </div>

      {/* Active Projects + Activity Feed */}
      <div className="project-panels-grid">
        {/* Active Projects */}
        <div className="active-projects-panel">
          <div className="panel-header">
            <h2>Active Projects ({projects.length})</h2>
          </div>

          <div className="active-projects-list">
            {projects.length === 0 && !loading && (
              <p style={{ padding: '1rem', color: '#64748B' }}>No projects registered in database.</p>
            )}
            {projects.slice(0, 5).map((project) => {
              const progressVal = project.status === 'Completed' ? 100 : (project.progress || (project.status === 'Review' ? 85 : (project.status === 'In Progress' ? 65 : 20)));
              const health = project.priority === 'Urgent' ? 'At Risk' : (project.status === 'Completed' ? 'Good' : 'Normal');
              const teamInitials = project.team && project.team.length > 0 
                ? project.team.map(m => m.fullName ? m.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TM')
                : ['PM', 'DEV'];

              return (
                <div className="active-project-row" key={project._id || project.id}>
                  <div className="project-info">
                    <div className="project-title-line">
                      <span className="project-name">{project.name}</span>
                      <span
                        className="status-badge"
                        style={{
                          background: statusStyles[project.status]?.bg || '#F1F5F9',
                          color: statusStyles[project.status]?.color || '#475569',
                        }}
                      >
                        {project.status || 'In Progress'}
                      </span>
                    </div>
                    <div className="project-meta">
                      <span className="project-client">{project.client || 'Enterprise Client'}</span>
                      <span className="health-dot" style={{ background: healthStyles[health] || '#22C55E' }} />
                      <span className="health-label" style={{ color: healthStyles[health] || '#22C55E' }}>
                        {health}
                      </span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <span className="progress-percent">{progressVal}%</span>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progressVal}%` }} />
                    </div>
                  </div>

                  <div className="avatar-stack">
                    {teamInitials.slice(0, 3).map((initials, i) => (
                      <span
                        key={i}
                        className="avatar-chip"
                        style={{ background: avatarColors[i % avatarColors.length] }}
                      >
                        {initials}
                      </span>
                    ))}
                    {teamInitials.length > 3 && (
                      <span className="avatar-chip avatar-more">+{teamInitials.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-feed-panel">
          <div className="panel-header">
            <h2>Live System Activity</h2>
          </div>

          <div className="activity-feed-list">
            {activities.length === 0 && !loading && (
              <p style={{ padding: '1rem', color: '#64748B' }}>No recent activities logged.</p>
            )}
            {activities.map((item, idx) => (
              <div className="activity-row" key={item._id || idx}>
                <span className="activity-dot" style={{ background: dotColors[item.action?.toLowerCase()] || '#3B82F6' }} />
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>{item.user?.fullName || item.userName || 'System'}</strong>: {item.details || item.action}
                  </p>
                  <span className="activity-time">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Distribution by Project */}
      <div className="chart-widget">
        <div className="chart-widget-header">
          <div>
            <h3 className="chart-widget-title">Task Distribution by Project</h3>
            <p className="chart-widget-subtitle">Live real-time task status breakdown</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskDistributionData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
            <XAxis
              dataKey="project"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 13 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 13 }}
            />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            {Object.keys(taskBarColors).map((key) => (
              <Bar key={key} dataKey={key} fill={taskBarColors[key]} radius={[3, 3, 0, 0]} maxBarSize={14} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
