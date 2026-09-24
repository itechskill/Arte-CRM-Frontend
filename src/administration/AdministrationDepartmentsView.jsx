import React, { useState, useEffect } from 'react';
import { Building2, Users, UserCheck, Plus, X, Search, Trash2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import './AdministrationDepartmentsView.css';

export default function AdministrationDepartmentsView({ searchQuery = '' }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [newDept, setNewDept] = useState({ name: '', head: '', count: '', location: '', budget: '' });

  const fetchDepartmentsFromDirectory = async () => {
    try {
      const { response, data } = await apiRequest('/api/admin/directory');
      if (response.ok && data.success && Array.isArray(data.data)) {
        const users = data.data;
        const deptMap = {};

        users.forEach(u => {
          const dName = u.department || 'General Administration';
          if (!deptMap[dName]) {
            deptMap[dName] = {
              id: dName,
              name: dName,
              head: u.role.includes('manager') || u.role === 'ceo' || u.role === 'admin' ? u.fullName : 'Department Lead',
              count: 0,
              location: 'Main Corporate Campus',
              budget: 'PKR 250,000'
            };
          }
          deptMap[dName].count += 1;
          if (u.role.includes('manager') || u.role === 'ceo' || u.role === 'admin') {
            deptMap[dName].head = u.fullName;
          }
        });

        setDepartments(Object.values(deptMap));
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsFromDirectory();
  }, []);

  const search = searchQuery || localSearch;

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;

    const dept = {
      id: Date.now().toString(),
      name: newDept.name.trim(),
      head: newDept.head.trim() || 'Unassigned',
      count: parseInt(newDept.count) || 1,
      location: newDept.location.trim() || 'Main Headquarters',
      budget: newDept.budget ? `${newDept.budget}` : 'PKR 100,000'
    };

    setDepartments([dept, ...departments]);
    setNewDept({ name: '', head: '', count: '', location: '', budget: '' });
    setIsModalOpen(false);
  };

  const handleDeleteDept = (id) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-emp-container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Company Departments</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>Manage organizational structure, department heads, and locations</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', gap: '8px' }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Filter departments..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#10B981', color: '#FFF', border: 'none',
              borderRadius: '8px', padding: '8px 16px', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      <div className="admin-dept-grid">
        {filteredDepts.map((dept) => (
          <div key={dept.id} className="admin-dept-card" style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="admin-dept-name" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#10B981" /> {dept.name}
              </div>
              <button
                onClick={() => handleDeleteDept(dept.id)}
                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                title="Remove department"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="admin-dept-head" style={{ fontSize: '0.88rem', color: '#334155' }}>
              Department Head: <strong>{dept.head}</strong>
            </div>

            <div className="admin-dept-meta" style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '4px' }}>
              <span>{dept.count} Members</span>
              <span>{dept.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '14px', width: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Add New Department</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance & Testing"
                  value={newDept.name}
                  onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Department Head</label>
                <input
                  type="text"
                  placeholder="e.g. Michael Vance"
                  value={newDept.head}
                  onChange={e => setNewDept({ ...newDept, head: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Initial Members</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newDept.count}
                    onChange={e => setNewDept({ ...newDept, count: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Location / Floor</label>
                  <input
                    type="text"
                    placeholder="Building A - Floor 2"
                    value={newDept.location}
                    onChange={e => setNewDept({ ...newDept, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}