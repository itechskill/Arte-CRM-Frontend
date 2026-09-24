import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { apiRequest } from '../utils/api';
import './RevenueChart.css';

export default function RevenueChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const { response, data: resData } = await apiRequest('/api/finance/invoices');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const monthlyAggregation = {};
        for (let i = 0; i < 12; i++) {
          monthlyAggregation[monthNames[i]] = {
            month: monthNames[i],
            thisYear: 0,
            lastYear: 0
          };
        }

        if (response.ok && resData.success && Array.isArray(resData.data)) {
          const paidInvoices = resData.data.filter(inv => inv.status === 'Paid');
          paidInvoices.forEach(inv => {
            const date = new Date(inv.issueDate || inv.createdAt || Date.now());
            const mName = monthNames[date.getMonth()];
            if (monthlyAggregation[mName]) {
              monthlyAggregation[mName].thisYear += Number(inv.amount) || 0;
            }
          });
        }

        setData(Object.values(monthlyAggregation));
      } catch (err) {
        console.error('Fetch revenue data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000) {
      return `${Math.round(tickItem / 1000)}k`;
    }
    return `${tickItem}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#0F172A',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          fontSize: '0.8rem',
          border: '1px solid #334155'
        }}>
          <p style={{ fontWeight: 700, marginBottom: '6px', color: '#94A3B8' }}>{label} Performance</p>
          <p style={{ color: '#3B82F6', fontWeight: 600 }}>
            Revenue Collected: ${payload[0]?.value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="widget-card" style={{ height: '380px' }}>
      <div className="widget-header">
        <div className="widget-title-group">
          <h3>Revenue Analytics</h3>
          <p>Real-time monthly invoiced collections from MongoDB</p>
        </div>
        <select 
          className="pill-select" 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="2026">Fiscal Year 2026</option>
        </select>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '0.85rem' }}>
            Loading revenue data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThisYear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '0.8rem', fontWeight: 500 }}
              />
              <Area 
                type="monotone" 
                dataKey="thisYear" 
                name="Paid Revenue (PKR)"
                stroke="#3B82F6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorThisYear)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
