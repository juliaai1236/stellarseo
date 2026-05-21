import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TrendingUp, Target, FileText, Users, Bell, Search, Settings, BarChart3, Activity, ChevronDown, ChevronUp, X, CheckCircle } from 'lucide-react';

const BASE = window.__BACKEND_URL__ || '';

async function apiFetch(path, opts = {}) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(BASE + path, opts);
      if (r.ok) return r.json();
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1500));
  }
  return null;
}

function useCssInjection() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      :root {
        --accent: #1E3A5F;
        --accent2: #FF6B35;
      }
      .glass {
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
      }
      .gradient-text {
        background: linear-gradient(135deg, #1E3A5F, #FF6B35, #FF8C5A);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .shimmer {
        background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      .fade-in { animation: fadeIn 0.3s ease forwards; }
      * { transition: all 0.2s ease; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
}

function Sidebar({ active, onNavigate }) {
  const navItems = [
    { icon: BarChart3, label: 'Dashboard', id: 'dashboard' },
    { icon: TrendingUp, label: 'Analytics', id: 'analytics' },
    { icon: FileText, label: 'Reports', id: 'reports' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-white/[0.02] h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold gradient-text">RankRocket</h1>
        <p className="text-xs text-slate-400 mt-1">StellarSEO</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                active === item.id
                  ? 'bg-[#1E3A5F]/20 text-white border border-[#FF6B35]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 glass p-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#FF6B35] flex items-center justify-center text-xs font-bold">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ searchTerm, onSearchChange, notificationCount }) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF6B35]/50 w-64"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-slate-400 hover:text-white" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B35] rounded-full text-xs flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#FF6B35]" />
      </div>
    </header>
  );
}

function KPICard({ icon: Icon, label, value, delta, isPositive }) {
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  const displayValue = value.includes('%') ? `${Math.round(count)}%` : `$${Math.round(count).toLocaleString()}`;

  return (
    <div className="glass p-5 fade-in hover:border-white/20 cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-[#1E3A5F]/20 rounded-lg">
          <Icon size={20} className="text-[#FF6B35]" />
        </div>
        {delta && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isPositive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{displayValue}</p>
    </div>
  );
}

function LineChart({ data }) {
  const [animate, setAnimate] = useState(false);
  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  useEffect(() => {
    setTimeout(() => setAnimate(true), 200);
  }, []);

  const points = (data || []).map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right),
    y: padding.top + (1 - d.value / Math.max(...data.map(d => d.value))) * (height - padding.top - padding.bottom),
    value: d.value,
    label: d.label
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaPath = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <div className="glass p-5 fade-in">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Performance Trend</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '250px' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 0 && (
          <>
            <path d={areaPath} fill="url(#lineGradient)" opacity={animate ? 1 : 0} style={{ transition: 'opacity 0.5s ease' }} />
            <path d={pathD} fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={animate ? 'none' : `${points[points.length - 1]?.x || 0} 1000`}
              style={{ transition: 'stroke-dasharray 2s ease' }}
            />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FF6B35" opacity={animate ? 1 : 0} style={{ transition: `opacity 0.3s ease ${i * 0.1}s` }} />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

function BarChart({ data }) {
  const width = 600;
  const height = 200;
  const barWidth = 30;
  const maxValue = Math.max(...(data || []).map(d => d.value));

  return (
    <div className="glass p-5 fade-in">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Keyword Distribution</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '200px' }}>
        {data && data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 40);
          return (
            <g key={i}>
              <rect
                x={i * (barWidth + 15) + 20}
                y={height - barHeight - 20}
                width={barWidth}
                height={barHeight}
                fill="#1E3A5F"
                opacity="0.8"
                rx="4"
              />
              <text
                x={i * (barWidth + 15) + 35}
                y={height - 5}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DataTable({ data, columns, onSort, sortConfig }) {
  const [sortField, setSortField] = useState(sortConfig?.field || '');
  const [sortDirection, setSortDirection] = useState(sortConfig?.direction || 'asc');

  const handleSort = (field) => {
    const newDirection = sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    if (onSort) onSort(field, newDirection);
  };

  const sortedData = useMemo(() => {
    if (!sortField || !data) return data || [];
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortField, sortDirection]);

  return (
    <div className="glass p-5 fade-in overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map(col => (
              <th
                key={col.field}
                className="text-left py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort(col.field)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {sortField === col.field && (
                    sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
              {columns.map(col => (
                <td key={col.field} className="py-3 px-4 text-slate-300">
                  {col.render ? col.render(row[col.field]) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg fade-in ${
      type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
    }`}>
      <CheckCircle size={16} />
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

function QuickActions() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ keyword: '', volume: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.keyword.trim()) newErrors.keyword = 'Keyword is required';
    if (!formData.volume || isNaN(formData.volume)) newErrors.volume = 'Valid volume is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setToast({ message: 'Keyword added successfully!', type: 'success' });
    setFormData({ keyword: '', volume: '' });
    setShowForm(false);
  };

  return (
    <div className="glass p-5 fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h3 className="text-sm font-medium text-slate-300 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-2 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-lg text-sm text-[#FF6B35] hover:bg-[#FF6B35]/20 transition-all"
        >
          Add New Keyword
        </button>
        <button className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-all">
          Generate Report
        </button>
        <button className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-all">
          Run Analysis
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <input
              type="text"
              placeholder="Keyword"
              value={formData.keyword}
              onChange={e => setFormData({...formData, keyword: e.target.value})}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF6B35]/50"
            />
            {errors.keyword && <p className="text-xs text-red-400 mt-1">{errors.keyword}</p>}
          </div>
          <div>
            <input
              type="number"
              placeholder="Monthly Volume"
              value={formData.volume}
              onChange={e => setFormData({...formData, volume: e.target.value})}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF6B35]/50"
            />
            {errors.volume && <p className="text-xs text-red-400 mt-1">{errors.volume}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm hover:bg-[#1E3A5F]/80 transition-all">
              Submit
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 text-slate-300 rounded-lg text-sm hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityData, setActivityData] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' });

  useCssInjection();

  // Mock data fallback
  const mockKpi = {
    revenue: 284500,
    keywords: 1247,
    conversion: 3.2,
    traffic: 84700
  };

  const mockChartData = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 145 },
    { label: 'Wed', value: 132 },
    { label: 'Thu', value: 158 },
    { label: 'Fri', value: 142 },
    { label: 'Sat', value: 167 },
    { label: 'Sun', value: 150 }
  ];

  const mockBarData = [
    { label: 'SEO', value: 85 },
    { label: 'PPC', value: 63 },
    { label: 'Social', value: 92 },
    { label: 'Email', value: 45 },
    { label: 'Content', value: 78 }
  ];

  const mockActivity = [
    { id: 1, keyword: 'organic skincare', volume: 14500, position: 3, date: '2024-01-15', status: 'improved' },
    { id: 2, keyword: 'vegan makeup', volume: 8900, position: 7, date: '2024-01-14', status: 'declined' },
    { id: 3, keyword: 'natural deodorant', volume: 12300, position: 2, date: '2024-01-13', status: 'improved' },
    { id: 4, keyword: 'clean beauty', volume: 21000, position: 5, date: '2024-01-12', status: 'stable' },
    { id: 5, keyword: 'sunscreen SPF', volume: 16700, position: 4, date: '2024-01-11', status: 'improved' }
  ];

  useEffect(() => {
    async function fetchData() {
      const [kpiRes, chartRes, barRes, activityRes] = await Promise.all([
        apiFetch('/api/kpi'),
        apiFetch('/api/chart'),
        apiFetch('/api/bar'),
        apiFetch('/api/activity')
      ]);

      setKpiData(kpiRes || mockKpi);
      setChartData(chartRes || mockChartData);
      setBarData(barRes || mockBarData);
      setActivityData(activityRes || mockActivity);
    }
    fetchData();
  }, []);

  const safeKpi = kpiData || mockKpi;
  const safeChart = chartData.length ? chartData : mockChartData;
  const safeBar = barData.length ? barData : mockBarData;
  const safeActivity = activityData.length ? activityData : mockActivity;

  const columns = [
    { field: 'keyword', label: 'Keyword' },
    { field: 'volume', label: 'Volume', render: v => v.toLocaleString() },
    { field: 'position', label: 'Position' },
    { field: 'date', label: 'Date' },
    { 
      field: 'status', 
      label: 'Status',
      render: v => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          v === 'improved' ? 'bg-green-500/10 text-green-400' : 
          v === 'declined' ? 'bg-red-500/10 text-red-400' : 
          'bg-yellow-500/10 text-yellow-400'
        }`}>
          {v}
        </span>
      )
    }
  ];

  const handleSort = (field, direction) => {
    setSortConfig({ field, direction });
    const sorted = [...safeActivity].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      if (typeof aVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    setActivityData(sorted);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#06080f] text-slate-100">
      <Sidebar active={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={3} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Dashboard Overview</h2>
              <p className="text-sm text-slate-400 mt-1">AI-powered SEO intelligence for e-commerce success</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KPICard icon={TrendingUp} label="Monthly Revenue" value={`${safeKpi.revenue?.toLocaleString() || '0'}`} delta="+12.5%" isPositive={true} />
            <KPICard icon={Target} label="Keywords Tracked" value={`${safeKpi.keywords?.toLocaleString() || '0'}`} delta="+8.3%" isPositive={true} />
            <KPICard icon={Activity} label="Conversion Rate" value={`${safeKpi.conversion || '0'}%`} delta="-2.1%" isPositive={false} />
            <KPICard icon={Users} label="Organic Traffic" value={`${safeKpi.traffic?.toLocaleString() || '0'}`} delta="+15.7%" isPositive={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <LineChart data={safeChart} />
            </div>
            <div>
              <BarChart data={safeBar} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <DataTable
                data={safeActivity}
                columns={columns}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}