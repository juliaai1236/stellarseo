import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, Bell, User, Menu, TrendingUp, TrendingDown, BarChart3, Globe, FileText, Settings as SettingsIcon, Activity, Zap, ArrowUpRight, ArrowDownRight, Clock, ExternalLink, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

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

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [user, setUser] = useState({ name: 'Sarah Chen', email: 'sarah@stellar.com', avatar: null })

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      :root { --accent: #F59E0B; --accent2: #D97706; }
      .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
      .gradient-text { background: linear-gradient(135deg, #F59E0B, #D97706, #B45309); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      .fade-in { animation: fadeIn 0.3s ease forwards; }
      @keyframes countUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      .count-up { animation: countUp 0.5s ease forwards; }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[#06080f] text-slate-100">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} notifications={notifications} setShowNotifications={setShowNotifications} showNotifications={showNotifications} setShowUserMenu={setShowUserMenu} showUserMenu={showUserMenu} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && <DashboardContent />}
          {currentPage === 'analytics' && <AnalyticsContent />}
          {currentPage === 'reports' && <ReportsContent />}
          {currentPage === 'settings' && <SettingsContent />}
        </main>
      </div>
      {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} />}
    </div>
  )
}

function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Globe },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <>
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 flex-col border-r border-white/5 bg-white/[0.02] h-full transition-all duration-300 hidden md:flex`}>
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">StellarRank</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {(navItems || []).map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="glass p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-1">Upgrade Plan</p>
            <p className="mb-2">Get AI-powered insights</p>
            <button className="w-full py-1.5 px-3 rounded-lg bg-[#F59E0B] text-[#06080f] font-medium hover:bg-[#D97706] transition-colors text-xs">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  )
}

function TopBar({ user, notifications, setShowNotifications, showNotifications, setShowUserMenu, showUserMenu, setSidebarOpen }) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0 bg-[#06080f]/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(prev => !prev)} className="md:hidden p-1 hover:bg-white/5 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search keywords, domains..." 
            className="w-72 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]/50 focus:ring-1 focus:ring-[#F59E0B]/20 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {(notifications || []).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F59E0B] rounded-full" />
            )}
          </button>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 glass border border-white/10 rounded-xl py-2 shadow-xl z-50">
              <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-white/5 text-left">Profile</button>
              <button className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-white/5 text-left">Settings</button>
              <button className="w-full px-4 py-2 text-sm text-red-400 hover:bg-white/5 text-left border-t border-white/5 mt-1 pt-2">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function NotificationsPanel({ notifications, onClose }) {
  return (
    <div className="fixed right-4 top-16 w-80 glass border border-white/10 rounded-xl p-4 shadow-2xl z-50 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Notifications</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      {(notifications || []).length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No new notifications</p>
        </div>
      )}
    </div>
  )
}

function KPICard({ icon: Icon, label, value, delta, color }) {
  const [displayValue, setDisplayValue] = useState(0)
  const targetValue = value || 0

  useEffect(() => {
    let start = 0
    const duration = 1000
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.floor(targetValue * eased)
      setDisplayValue(start)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [targetValue])

  return (
    <div className="glass p-5 fade-in hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color || 'bg-[#F59E0B]/10'}`}>
          <Icon className={`w-5 h-5 ${color ? `text-[${color.replace('bg-', '')}]` : 'text-[#F59E0B]'}`} />
        </div>
        {delta !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            delta >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold count-up">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </p>
    </div>
  )
}

function LineChart({ data }) {
  const [animate, setAnimate] = useState(false)
  const width = 600
  const height = 200

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
  }, [])

  const points = useMemo(() => {
    if (!data || data.length === 0) return ''
    const maxVal = Math.max(...data.map(d => d.value))
    const minVal = Math.min(...data.map(d => d.value))
    const range = maxVal - minVal || 1
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d.value - minVal) / range) * (height - 40) - 20
      return `${x},${y}`
    }).join(' ')
  }, [data, animate])

  const gradientId = 'lineGradient'

  return (
    <div className="glass p-5 fade-in">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Keyword Rankings (7 days)</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
          className="transition-all duration-1000"
          style={{ opacity: animate ? 1 : 0 }}
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="2"
          className="transition-all duration-1000"
          style={{ 
            strokeDasharray: width * 2,
            strokeDashoffset: animate ? 0 : width * 2,
          }}
        />
        {/* Points */}
        {(data || []).map((d, i) => {
          const maxVal = Math.max(...data.map(d => d.value))
          const minVal = Math.min(...data.map(d => d.value))
          const range = maxVal - minVal || 1
          const x = (i / (data.length - 1)) * width
          const y = height - ((d.value - minVal) / range) * (height - 40) - 20
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#F59E0B"
              className="transition-all duration-500"
              style={{ opacity: animate ? 1 : 0 }}
            />
          )
        })}
      </svg>
    </div>
  )
}

function DataTable({ columns, data, onSort, sortConfig }) {
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    onSort && onSort(field, sortDirection)
  }

  const sortedData = useMemo(() => {
    if (!sortField || !data) return data || []
    return [...data].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortField, sortDirection])

  return (
    <div className="glass overflow-hidden fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {(columns || []).map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-xs font-medium text-slate-400 text-left ${col.sortable ? 'cursor-pointer hover:text-slate-200' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && (
                      <span className="text-[#F59E0B]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(sortedData || []).map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                {(columns || []).map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [kpiData, setKpiData] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [activityData, setActivityData] = useState(null)
  const [loading, setLoading] = useState(true)

  const mockKpiData = useMemo(() => ({
    keywords: 2847,
    keywordsDelta: 12.5,
    traffic: 152341,
    trafficDelta: -3.2,
    backlinks: 8976,
    backlinksDelta: 8.1,
    conversion: 4.3,
    conversionDelta: 2.1
  }), [])

  const mockChartData = useMemo(() => [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 48 },
    { day: 'Thu', value: 61 },
    { day: 'Fri', value: 58 },
    { day: 'Sat', value: 72 },
    { day: 'Sun', value: 68 }
  ], [])

  const mockActivityData = useMemo(() => [
    { time: '2 min ago', action: 'Keyword update', keyword: 'organic skincare products', status: 'completed', details: 'Rank improved to #3' },
    { time: '15 min ago', action: 'Content generated', keyword: 'best face moisturizer 2024', status: 'completed', details: 'Blog post published' },
    { time: '1 hour ago', action: 'Link outreach', keyword: 'buy natural cosmetics', status: 'pending', details: 'Email sent to 5 bloggers' },
    { time: '3 hours ago', action: 'Ranking alert', keyword: 'vegan makeup brands', status: 'warning', details: 'Dropped from #2 to #5' },
    { time: '5 hours ago', action: 'Backlink found', keyword: 'organic hair products', status: 'completed', details: 'New backlink from .edu domain' }
  ], [])

  const columns = useMemo(() => [
    { key: 'time', label: 'Time', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'keyword', label: 'Keyword', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (val) => (
      <span className={`flex items-center gap-1 text-xs ${
        val === 'completed' ? 'text-green-400' : 
        val === 'pending' ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {val === 'completed' ? <CheckCircle className="w-3 h-3" /> : 
         val === 'pending' ? <Loader2 className="w-3 h-3 animate-spin" /> : 
         <AlertCircle className="w-3 h-3" />}
        {val}
      </span>
    )},
    { key: 'details', label: 'Details', sortable: false }
  ], [])

  useEffect(() => {
    const fetchData = async () => {
      const result = await apiFetch('/api/dashboard')
      if (result) {
        setKpiData(result.kpis)
        setChartData(result.chartData)
        setActivityData(result.activityData)
      } else {
        setKpiData(mockKpiData)
        setChartData(mockChartData)
        setActivityData(mockActivityData)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass p-5 shimmer h-28" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard 
          icon={Globe} 
          label="Keywords Tracked" 
          value={kpiData?.keywords || 0} 
          delta={kpiData?.keywordsDelta || 0} 
          color="bg-[#F59E0B]/10"
        />
        <KPICard 
          icon={Activity} 
          label="Organic Traffic" 
          value={kpiData?.traffic || 0} 
          delta={kpiData?.trafficDelta || 0} 
          color="bg-blue-500/10"
        />
        <KPICard 
          icon={ExternalLink} 
          label="Backlinks" 
          value={kpiData?.backlinks || 0} 
          delta={kpiData?.backlinksDelta || 0} 
          color="bg-purple-500/10"
        />
        <KPICard 
          icon={TrendingUp} 
          label="Conversion Rate" 
          value={kpiData?.conversion || 0} 
          delta={kpiData?.conversionDelta || 0} 
          color="bg-green-500/10"
        />
      </div>

      <LineChart data={chartData} />

      <div>
        <h2 className="text-lg font-semibold gradient-text mb-4">Recent Activity</h2>
        <DataTable columns={columns} data={activityData} />
      </div>

      <div className="glass p-5 fade-in">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left">
            <Zap className="w-5 h-5 text-[#F59E0B] mb-2" />
            <p className="text-xs font-medium">New Keyword</p>
            <p className="text-xs text-slate-500">Add to tracker</p>
          </button>
          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left">
            <FileText className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs font-medium">Generate Content</p>
            <p className="text-xs text-slate-500">AI-powered blog</p>
          </button>
          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left">
            <ExternalLink className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-xs font-medium">Link Outreach</p>
            <p className="text-xs text-slate-500">Start campaign</p>
          </button>
          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left">
            <BarChart3 className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-xs font-medium">Full Report</p>
            <p className="text-xs text-slate-500">Export PDF</p>
          </button>
        </div>
      </div>
    </div>
  )
}

function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Analytics Overview</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-5 fade-in">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Top Performing Keywords</h3>
          <div className="space-y-3">
            {['organic skincare products', 'best face moisturizer', 'natural makeup brands', 'vegan cosmetics', 'hair growth serum'].map((kw, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-slate-200">{kw}</p>
                  <p className="text-xs text-slate-500">Positions: {[1,3,2,5,4][i]}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  [1,3,2,5,4][i] <= 3 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  #{[1,3,2,5,4][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-5 fade-in">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {[
              { source: 'Organic Search', percentage: 62, color: 'bg-[#F59E0B]' },
              { source: 'Direct', percentage: 18, color: 'bg-blue-500' },
              { source: 'Referral', percentage: 12, color: 'bg-purple-500' },
              { source: 'Social', percentage: 8, color: 'bg-green-500' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24">{item.source}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportsContent() {
  const [email, setEmail] = useState('')
  const [schedule, setSchedule] = useState('weekly')
  const [toast, setToast] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setToast({ type: 'error', message: 'Please enter a valid email address' })
      return
    }
    setToast({ type: 'success', message: `Report scheduled ${schedule} to ${email}` })
    setEmail('')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Reports</h1>
      <div className="max-w-md">
        <div className="glass p-5 fade-in">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Schedule Report</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Schedule</label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-[#F59E0B]/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-[#F59E0B] text-[#06080f] font-medium hover:bg-[#D97706] transition-colors text-sm"
            >
              Schedule Report
            </button>
          </form>
        </div>
      </div>
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-sm shadow-2xl z-50 fade-in ${
          toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="glass p-5 fade-in">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Recent Reports</h3>
        <div className="space-y-2">
          {['Weekly SEO Performance', 'Keyword Rankings Report', 'Backlink Audit'].map((report, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm text-slate-200">{report}</span>
              </div>
              <button className="text-xs text-[#F59E0B] hover:text-[#D97706] flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Settings</h1>
      <div className="max-w-lg space-y-4">
        <div className="glass p-5 fade-in">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Profile Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                defaultValue="Sarah Chen"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-[#F59E0B]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Email</label>
              <input
                type="email"
                defaultValue="sarah@stellar.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-[#F59E0B]/50"
              />
            </div>
            <button className="py-2 px-4 rounded-lg bg-[#F59E0B] text-[#06080f] font-medium hover:bg-[#D97706] transition-colors text-sm">
              Save Changes
            </button>
          </div>
        </div>
        <div className="glass p-5 fade-in">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Notification Preferences</h3>
          <div className="space-y-2">
            {['Ranking changes', 'New backlinks', 'Weekly digest'].map((pref, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#F59E0B]" />
                <span className="text-sm text-slate-300">{pref}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App