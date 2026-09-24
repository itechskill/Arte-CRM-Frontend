import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiRequest } from '../utils/api';
import './DealsOverviewChart.css';

export default function DealsOverviewChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealsOverview = async () => {
      try {
        const { response, data: resData } = await apiRequest('/api/crm/deals');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Show last 6 months
        const monthlyMap = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = monthNames[d.getMonth()];
          monthlyMap[mName] = {
            month: mName,
            deals: 0,
            target: 5
          };
        }

        if (response.ok && resData.success && Array.isArray(resData.data)) {
          const wonDeals = resData.data.filter(d => ['Won', 'Closed Won'].includes(d.stage));
          wonDeals.forEach(deal => {
            const date = new Date(deal.updatedAt || deal.createdAt || Date.now());
            const mName = monthNames[date.getMonth()];
            if (monthlyMap[mName]) {
              monthlyMap[mName].deals += 1;
            }
          });
        }

        setData(Object.values(monthlyMap));
      } catch (err) {
        console.error('Fetch deals overview error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDealsOverview();
  }, []);

  return (
    <div className="widget-card" style={{ height: '340px' }}>
      <div className="widget-header">
        <div className="widget-title-group">
          <h3>Deals Overview</h3>
          <p>Closed deals volume by month (Live MongoDB)</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#3B82F6' }}></span> Closed Deals
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: '220px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '0.85rem' }}>
            Loading deals...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ backgroundColor: '#0F172A', color: 'white', borderRadius: '8px', border: 'none', fontSize: '0.8rem' }}
              />
              <Bar dataKey="deals" name="Won Deals" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.deals > 0 ? '#3B82F6' : '#CBD5E1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
