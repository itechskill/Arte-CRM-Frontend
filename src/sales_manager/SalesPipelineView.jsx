import React, { useState, useEffect } from 'react';
import { Filter, ArrowDown, TrendingUp, CheckCircle, Percent, Clock } from 'lucide-react';
import { apiRequest } from '../utils/api';
import './SalesPipelineView.css';

export default function SalesPipelineView() {
  const [stages, setStages] = useState([]);
  const [funnelConversion, setFunnelConversion] = useState('0.0%');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        const { response, data } = await apiRequest('/api/sales-manager/dashboard-stats');
        if (response.ok && data.success) {
          const stats = data.data;
          const pipelineStages = stats.pipelineStages || [];
          const totalDealsCount = stats.totalDeals || 1;
          const wonCount = stats.wonDealsCount || 0;
          const convRate = totalDealsCount > 0 ? ((wonCount / totalDealsCount) * 100).toFixed(1) : '0.0';
          setFunnelConversion(`${convRate}%`);

          const mappedStages = pipelineStages.map((stg, idx, arr) => {
            const pctOfTotal = totalDealsCount > 0 ? ((stg.count / totalDealsCount) * 100).toFixed(1) : '0.0';
            const nextStage = arr[idx + 1];
            const drop = nextStage 
              ? (stg.count > 0 ? Math.max(0, ((stg.count - nextStage.count) / stg.count) * 100).toFixed(1) + '%' : '0%')
              : '0%';

            return {
              stage: stg.label || stg.id,
              count: stg.count,
              value: stg.pipelineValue || 'PKR 0',
              conv: `${Math.max(10, Math.min(100, Math.round((stg.count / (pipelineStages[0]?.count || totalDealsCount || 1)) * 100)))}%`,
              drop: drop
            };
          });

          setStages(mappedStages);
        }
      } catch (err) {
        console.error('Fetch sales pipeline funnel error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  return (
    <div className="sales-sm-pipeline-view">
      <div className="pipeline-header-card">
        <div>
          <h2 className="pipeline-title">Sales Funnel & Stage Conversion</h2>
          <p className="pipeline-subtitle">Live real-time breakdown of conversion rates and stage velocity from MongoDB</p>
        </div>
        <div className="funnel-summary-badge">
          <TrendingUp size={16} />
          <span>Overall Funnel Conversion: {funnelConversion}</span>
        </div>
      </div>

      <div className="funnel-visualization-container">
        {stages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
            No deals found in pipeline currently.
          </div>
        )}
        {stages.map((item, idx) => (
          <React.Fragment key={idx}>
            <div className="funnel-step-row">
              <div className="step-info-col">
                <span className="step-num">{idx + 1}</span>
                <div className="step-titles">
                  <span className="step-name">{item.stage}</span>
                  <span className="step-val">{item.value} ({item.count} Opportunities)</span>
                </div>
              </div>

              <div className="step-bar-wrap">
                <div 
                  className={`step-bar-fill step-gradient-${idx + 1}`} 
                  style={{ width: item.conv }}
                >
                  <span className="bar-conv-label">{item.conv}</span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="step-drop-col">
                  <ArrowDown size={14} className="drop-icon" />
                  <span>{item.drop} Drop-off</span>
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
