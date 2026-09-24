import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { apiRequest } from '../utils/api';
import './PipelineDonutChart.css';

const STAGE_COLORS = {
  'Won': '#10B981',
  'Closed Won': '#10B981',
  'Proposal': '#F59E0B',
  'Negotiation': '#3B82F6',
  'Qualification': '#8B5CF6',
  'Closed Lost': '#EF4444',
  'Lost': '#EF4444'
};

export default function PipelineDonutChart() {
  const [data, setData] = useState([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        const { response, data: resData } = await apiRequest('/api/crm/deals');
        if (response.ok && resData.success && Array.isArray(resData.data)) {
          const deals = resData.data;
          setTotalDeals(deals.length);

          const stageCounts = {};
          deals.forEach(d => {
            const st = d.stage || 'Qualification';
            stageCounts[st] = (stageCounts[st] || 0) + 1;
          });

          const total = deals.length || 1;
          const chartData = Object.entries(stageCounts).map(([name, count]) => ({
            name,
            count,
            value: Math.round((count / total) * 100),
            color: STAGE_COLORS[name] || '#64748B'
          }));

          setData(chartData);
        }
      } catch (err) {
        console.error('Fetch pipeline data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  return (
    <div className="widget-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div className="widget-header">
        <div className="widget-title-group">
          <h3>Project Status & Deals Pipeline</h3>
          <p>Real-time deal stage distribution from MongoDB</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
        {loading ? (
          <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Loading pipeline...</div>
        ) : data.length === 0 ? (
          <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No deals currently recorded.</div>
        ) : (
          <div style={{ width: '180px', height: '180px', position: 'relative', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}% of total`, name]}
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    color: 'white', 
                    borderRadius: '8px', 
                    border: 'none',
                    fontSize: '0.8rem' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{totalDeals}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>Total Deals</div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
        gap: '10px 12px',
        paddingTop: '12px',
        borderTop: '1px solid #F1F5F9'
      }}>
        {data.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0, gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></span>
              <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', flexShrink: 0 }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}