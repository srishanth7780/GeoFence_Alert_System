// ============================================================
// GEOFENCE ALERT SYSTEM — Complete Dashboard (App.jsx)
// Stack: React + Vite + Tailwind CSS + Recharts + Lucide
// All UI, state, API calls, and routing in one file.
// ============================================================


// Add these imports at the top of App.jsx
import { db } from './firebase';
import {
  collection, onSnapshot, doc, updateDoc,
  addDoc, deleteDoc, serverTimestamp, query, orderBy, limit
} from 'firebase/firestore';


import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MapPin, Bell, Cpu, FileDown,
  Truck, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Plus, Trash2, Eye, EyeOff, Wifi, WifiOff, Moon, Sun,
  TrendingUp, Activity, Clock, Filter, Search, X,
  ChevronRight, Zap, Shield, Settings, Menu, LogOut, User, Lock,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─────────────────────────────────────────────
// CONFIG  — point to your backend
// ─────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "https://geofence-backend-1-9bad.onrender.com/api";

// ─────────────────────────────────────────────
// DYNAMIC CHART DATA GENERATOR
// ─────────────────────────────────────────────
function getChartData(alerts) {
  const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  const bins = hours.map(h => ({ hour: h, entries: 0, exits: 0 }));
  
  alerts.forEach(a => {
    if (!a.triggered_at) return;
    const date = a.triggered_at.toDate ? a.triggered_at.toDate() : new Date(a.triggered_at);
    const today = new Date();
    // Compare dates (day, month, year)
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      const hr = date.getHours();
      const binIdx = Math.min(Math.floor(hr / 2), bins.length - 1);
      if (a.alert_type === 'ENTRY') {
        bins[binIdx].entries++;
      } else if (a.alert_type === 'EXIT') {
        bins[binIdx].exits++;
      }
    }
  });
  return bins;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const timeAgo = (dateInput) => {
  if (!dateInput) return "Never";
  let date;
  if (dateInput.toDate && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const sec = Math.floor((Date.now() - date) / 1000);
  if (sec < 60)   return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400)return `${Math.floor(sec / 3600)}h ago`;
  return date.toLocaleDateString();
};

const priorityColor = (p) => ({
  critical: "text-red-400 bg-red-500/10 border-red-500/30",
  high:     "text-orange-400 bg-orange-500/10 border-orange-500/30",
  medium:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  low:      "text-green-400 bg-green-500/10 border-green-500/30",
}[p] || "text-slate-400 bg-slate-500/10 border-slate-500/30");

const statusDot = (s) => ({
  inside:  "bg-emerald-400 shadow-emerald-400/50",
  outside: "bg-red-400 shadow-red-400/50",
  unknown: "bg-slate-400",
}[s] || "bg-slate-400");

const alertIcon = (type) =>
  type === "ENTRY"
    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
    : <XCircle className="w-4 h-4 text-red-400" />;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22
    }
  }
};

function exportCSV(rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv  = [keys.join(","), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? "")).join(","))].join("\n");
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `geofence-alerts-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ─────────────────────────────────────────────
// API LAYER
// ─────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  try {
    const r = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    let data;
    try {
      data = await r.json();
    } catch {
      data = null;
    }
    if (!r.ok) {
      return { error: data?.error || data?.message || `HTTP ${r.status}: ${r.statusText}` };
    }
    return data;
  } catch (err) {
    return { error: err.message || "Network Error: Backend might be offline." };
  }
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

/** Sidebar navigation */
function Sidebar({ active, setActive, dark, toggleDark, collapsed, setCollapsed, onLogout }) {
  const nav = [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "devices",    label: "Devices",    icon: Truck            },
    { id: "geofences",  label: "Geofences",  icon: MapPin           },
    { id: "alerts",     label: "Alerts",     icon: Bell             },
    { id: "ai",         label: "AI Report",  icon: Cpu              },
    { id: "export",     label: "Export",     icon: FileDown         },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className={`
        flex flex-col h-screen sticky top-0 z-40
        ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}
        border-r overflow-hidden
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0"
            >
              <p className={`text-sm font-bold tracking-tight truncate ${dark ? "text-white" : "text-slate-900"}`}>GeoFence</p>
              <p className="text-xs text-slate-500 truncate">Alert System</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`ml-auto p-1 rounded-md ${dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {nav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={id}
              onClick={() => setActive(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden
                ${isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/20"
                  : dark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!collapsed && isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="ml-auto"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className={`p-3 border-t ${dark ? "border-slate-800" : "border-slate-200"} flex flex-col gap-2`}>
        <button
          onClick={toggleDark}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
            ${dark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
        >
          {dark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                {dark ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-rose-400 hover:bg-rose-500/10`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  );
}

/** Stat card */
function StatCard({ label, value, sub, icon: Icon, color, dark }) {
  const [hovered, setHovered] = useState(false);
  const colors = {
    cyan:   "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    emerald:"from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    red:    "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    blue:   "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  };
  return (
    <motion.div 
      variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5, scale: 1.02, boxShadow: dark ? "0 10px 30px -10px rgba(6,182,212,0.15)" : "0 10px 30px -10px rgba(0,0,0,0.06)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
      rounded-xl border bg-gradient-to-br p-5 ${colors[color]}
      ${dark ? "bg-slate-900" : "bg-white"}
    `}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${dark ? "text-slate-500" : "text-slate-500"}`}>{label}</p>
          <p className={`text-3xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>{value}</p>
          {sub && <p className={`text-xs mt-1 ${colors[color].split(" ").at(-1)}`}>{sub}</p>}
        </div>
        <motion.div 
          animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? 12 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${colors[color].split(" ").at(-1)}`} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Alert feed item */
function AlertItem({ alert, onMarkRead, onDelete, dark }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`
      flex items-start gap-3 p-3 rounded-lg border transition-all
      ${!alert.is_read
        ? dark ? "bg-slate-800/80 border-slate-700" : "bg-blue-50 border-blue-200"
        : dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}
    `}>
      <div className="mt-0.5">{alertIcon(alert.alert_type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{alert.device_name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor(alert.priority)}`}>
            {alert.priority}
          </span>
          {!alert.is_read && (
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </div>
        <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {alert.alert_type === "ENTRY" ? "Entered" : "Exited"} <strong>{alert.geofence_name}</strong> · via {alert.notified_via}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{timeAgo(alert.triggered_at)}</p>
      </div>
      <div className="flex flex-col gap-1 items-end justify-between self-stretch">
        {!alert.is_read && (
          <button
            onClick={() => onMarkRead(alert.id)}
            className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
          >
            Mark read
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/** Device row */
function DeviceRow({ device, dark }) {
  return (
    <tr className={`border-b text-sm transition-colors
      ${dark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shadow-lg ${statusDot(device.status)}`} />
          <span className={`font-medium ${dark ? "text-white" : "text-slate-900"}`}>{device.name}</span>
        </div>
      </td>
      <td className={`px-4 py-3 font-mono text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{device.device_id}</td>
      <td className="px-4 py-3">
        <span className={`capitalize text-xs px-2 py-0.5 rounded-full
          ${device.type === "vehicle" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
          {device.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`capitalize text-xs font-medium px-2 py-0.5 rounded-full border
          ${device.status === "inside"  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
            device.status === "outside" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                                          "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>
          {device.status}
        </span>
      </td>
      <td className={`px-4 py-3 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{device.owner_name || "—"}</td>
      <td className={`px-4 py-3 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{timeAgo(device.last_seen)}</td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────

/** Dashboard overview */
function DashboardView({ devices, alerts, dark, markAlertAsReadInFirestore, deleteAlertFromFirestore }) {
  const insideCount   = devices.filter(d => d.status === "inside").length;
  const outsideCount  = devices.filter(d => d.status === "outside").length;
  const unreadCount   = alerts.filter(a => !a.is_read).length;
  const criticalCount = alerts.filter(a => a.priority === "critical" && !a.is_read).length;

  const pieData = [
    { name: "Inside",  value: insideCount,                        color: "#34d399" },
    { name: "Outside", value: outsideCount,                       color: "#f87171" },
    { name: "Unknown", value: devices.length - insideCount - outsideCount, color: "#94a3b8" },
  ];

  const labelStyle = dark ? "text-slate-400" : "text-slate-500";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Devices"    value={devices.length}  sub={`${insideCount} inside zone`}  icon={Truck}         color="cyan"    dark={dark} />
        <StatCard label="Inside Geofence" value={insideCount}     sub="active & tracked"              icon={CheckCircle}   color="emerald" dark={dark} />
        <StatCard label="Unread Alerts"   value={unreadCount}     sub={`${criticalCount} critical`}   icon={Bell}          color="orange"  dark={dark} />
        <StatCard label="Outside Fence"   value={outsideCount}    sub="may need attention"            icon={AlertTriangle} color="red"     dark={dark} />
      </div>

      {/* Charts row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Activity line chart */}
        <div className={`xl:col-span-2 rounded-xl border p-5 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
            Today's Activity <span className={`text-xs font-normal ${labelStyle}`}>— entries vs exits</span>
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getChartData(alerts)} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: dark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: dark ? "#e2e8f0" : "#1e293b" }}
              />
              <Bar dataKey="entries" fill="#22d3ee" radius={[4,4,0,0]} />
              <Bar dataKey="exits"   fill="#f87171" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className={`rounded-xl border p-5 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>Fleet Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: dark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent alerts */}
      <motion.div variants={itemVariants} className={`rounded-xl border p-5 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Recent Alerts</h3>
          <span className={`text-xs ${labelStyle}`}>{unreadCount} unread</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {alerts.slice(0, 6).map(a => (
              <AlertItem key={a.id} alert={a} onMarkRead={markAlertAsReadInFirestore} onDelete={deleteAlertFromFirestore} dark={dark} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Devices management view */
function DevicesView({ devices, setDevices, dark, addDeviceToFirestore, deleteDeviceFromFirestore }) {
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ device_id: "", name: "", type: "vehicle", owner_name: "", phone: "", email: "" });
  const [saving, setSaving]     = useState(false);

  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.device_id.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const result = await addDeviceToFirestore(form);
    if (result) {
      setDevices(prev => [...prev, result]);
    }
    setForm({ device_id: "", name: "", type: "vehicle", owner_name: "", phone: "", email: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDeviceFromFirestore(id);
    setDevices(prev => prev.filter(d => d.id !== id));
  }

  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50
    ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>Fleet Devices</h2>
        <div className="flex gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm flex-1
            ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search devices…"
              className={`bg-transparent outline-none flex-1 ${dark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`}
            />
          </div>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-semibold transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4" /> Add Device
          </motion.button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className={`rounded-xl border p-5 mb-5 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>Register New Device</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input required placeholder="Device ID (e.g. TRUCK-001)" value={form.device_id} onChange={e => setForm(f => ({...f, device_id: e.target.value}))} className={inputCls} />
                <input required placeholder="Name (e.g. Alpha Hauler)"   value={form.name}      onChange={e => setForm(f => ({...f, name: e.target.value}))}      className={inputCls} />
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className={inputCls}>
                  <option value="vehicle">Vehicle</option>
                  <option value="personnel">Personnel</option>
                  <option value="asset">Asset</option>
                </select>
                <input placeholder="Owner name"   value={form.owner_name} onChange={e => setForm(f => ({...f, owner_name: e.target.value}))} className={inputCls} />
                <input placeholder="Phone (+91…)" value={form.phone}      onChange={e => setForm(f => ({...f, phone: e.target.value}))}      className={inputCls} />
                <input placeholder="Email"        value={form.email}      onChange={e => setForm(f => ({...f, email: e.target.value}))}      className={inputCls} type="email" />
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button type="submit" disabled={saving}
                  whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-semibold transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25 disabled:opacity-50">
                  {saving ? "Saving…" : "Save Device"}
                </motion.button>
                <motion.button type="button" onClick={() => setShowForm(false)}
                  whileHover={{ scale: 1.02, backgroundColor: dark ? "rgba(51, 65, 85, 0.8)" : "rgba(226, 232, 240, 0.8)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
                {["Name", "Device ID", "Type", "Status", "Owner", "Last Seen", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
              {filtered.map((d, index) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.25, type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.002, backgroundColor: dark ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.4)" }}
                  key={d.id} className={`border-b text-sm transition-colors ${dark ? "border-slate-800" : "border-slate-100"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shadow-lg ${statusDot(d.status)}`} />
                      <span className={`font-medium ${dark ? "text-white" : "text-slate-900"}`}>{d.name}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{d.device_id}</td>
                  <td className="px-4 py-3">
                    <span className={`capitalize text-xs px-2.5 py-0.5 rounded-full border font-medium
                      ${d.type === "vehicle" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : d.type === "personnel" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full border
                      ${d.status === "inside"  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        d.status === "outside" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
                                                  "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{d.owner_name || "—"}</td>
                  <td className={`px-4 py-3 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{timeAgo(d.last_seen)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!filtered.length && (
            <div className={`text-center py-12 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>No devices found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Geofences view */
function GeofencesView({ geofences, setGeofences, dark, addGeofenceToFirestore, updateGeofenceInFirestore, deleteGeofenceFromFirestore }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", shape: "circle", center_lat: "", center_lng: "", radius_m: "" });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, center_lat: parseFloat(form.center_lat), center_lng: parseFloat(form.center_lng), radius_m: parseFloat(form.radius_m) };
    const result = await addGeofenceToFirestore(payload);
    if (result) {
      setGeofences(prev => [...prev, result]);
    }
    setForm({ name: "", description: "", shape: "circle", center_lat: "", center_lng: "", radius_m: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleToggle(id) {
    const geofence = geofences.find(g => g.id === id);
    if (geofence) {
      await updateGeofenceInFirestore(id, { is_active: !geofence.is_active });
      setGeofences(prev => prev.map(g => g.id === id ? { ...g, is_active: !g.is_active } : g));
    }
  }

  async function handleDeleteGeofence(id) {
    await deleteGeofenceFromFirestore(id);
    setGeofences(prev => prev.filter(g => g.id !== id));
  }

  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50
    ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>Geofences</h2>
        <motion.button onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.3)" }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-semibold transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25">
          <Plus className="w-4 h-4" /> New Geofence
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className={`rounded-xl border p-5 mb-5 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>Create Geofence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input required placeholder="Name (e.g. Main Depot)" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className={inputCls} />
                <input placeholder="Description" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className={inputCls} />
                <select value={form.shape} onChange={e => setForm(f=>({...f,shape:e.target.value}))} className={inputCls}>
                  <option value="circle">Circle</option>
                </select>
                <input required placeholder="Center Latitude (e.g. 17.385)" value={form.center_lat} onChange={e => setForm(f=>({...f,center_lat:e.target.value}))} className={inputCls} />
                <input required placeholder="Center Longitude (e.g. 78.486)" value={form.center_lng} onChange={e => setForm(f=>({...f,center_lng:e.target.value}))} className={inputCls} />
                <input required placeholder="Radius in meters (e.g. 500)" value={form.radius_m} onChange={e => setForm(f=>({...f,radius_m:e.target.value}))} className={inputCls} />
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button type="submit" disabled={saving}
                  whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-semibold transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25 disabled:opacity-50">
                  {saving ? "Saving…" : "Save Geofence"}
                </motion.button>
                <motion.button type="button" onClick={() => setShowForm(false)}
                  whileHover={{ scale: 1.02, backgroundColor: dark ? "rgba(51, 65, 85, 0.8)" : "rgba(226, 232, 240, 0.8)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
        {geofences.map(g => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ 
              y: -6, 
              scale: 1.015,
              borderColor: dark ? "rgba(6, 182, 212, 0.4)" : "rgba(6, 182, 212, 0.3)",
              boxShadow: dark ? "0 15px 35px -10px rgba(6,182,212,0.25)" : "0 15px 35px -10px rgba(0,0,0,0.12)" 
            }}
            key={g.id} className={`rounded-xl border p-5 transition-all ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}
            ${g.is_active ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={`font-semibold text-sm ${dark ? "text-white" : "text-slate-900"}`}>{g.name}</h3>
                <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-500"}`}>{g.description || g.shape}</p>
              </div>
              <div className="flex gap-1">
                <motion.button onClick={() => handleToggle(g.id)}
                  whileHover={{ scale: 1.15, rotate: -6 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-md transition-colors ${g.is_active ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 bg-slate-500/10"}`}>
                  {g.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>
                <motion.button onClick={() => handleDeleteGeofence(g.id)}
                  whileHover={{ scale: 1.15, rotate: 6, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className={`space-y-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
              <p><span className="font-medium">Shape:</span> {g.shape}</p>
              {g.center_lat && <p><span className="font-medium">Center:</span> {parseFloat(g.center_lat).toFixed(4)}, {parseFloat(g.center_lng).toFixed(4)}</p>}
              {g.radius_m   && <p><span className="font-medium">Radius:</span> {g.radius_m}m</p>}
            </div>
            <div className={`mt-3 pt-3 border-t ${dark ? "border-slate-800" : "border-slate-100"}`}>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                ${g.is_active ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 bg-slate-500/10"}`}>
                {g.is_active ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Alerts view */
function AlertsView({ alerts, setAlerts, dark, markAlertAsReadInFirestore, deleteAlertFromFirestore }) {
  const [filter, setFilter]   = useState("all");  // all | unread | critical
  const [search, setSearch]   = useState("");

  const filtered = alerts.filter(a => {
    const matchFilter = filter === "all" ? true : filter === "unread" ? !a.is_read : a.priority === "critical";
    const matchSearch = !search || a.device_name?.toLowerCase().includes(search.toLowerCase()) || a.geofence_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  async function markRead(id) {
    await markAlertAsReadInFirestore(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  }

  async function handleDeleteAlert(id) {
    await deleteAlertFromFirestore(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  function markAllRead() {
    alerts.filter(a => !a.is_read).forEach(a => markAlertAsReadInFirestore(a.id));
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  }

  const filterBtn = (val, label) => (
    <button onClick={() => setFilter(val)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
        ${filter === val
          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
          : dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>
          Alert Log <span className={`text-sm font-normal ml-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>{filtered.length} alerts</span>
        </h2>
        <div className="flex gap-2 items-center flex-wrap">
          {filterBtn("all",      "All")}
          {filterBtn("unread",   "Unread")}
          {filterBtn("critical", "Critical")}
          <button onClick={markAllRead}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${dark ? "bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-900"}`}>
            Mark all read
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
        ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search device or geofence…"
          className={`bg-transparent outline-none flex-1 ${dark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`} />
        {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.map(a => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              whileHover={{ scale: 1.01 }}
              key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all
              ${!a.is_read
              ? dark ? "bg-slate-800/80 border-slate-700" : "bg-blue-50 border-blue-200"
              : dark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="mt-1">{alertIcon(a.alert_type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-semibold text-sm ${dark ? "text-white" : "text-slate-900"}`}>{a.device_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor(a.priority)}`}>{a.priority}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${a.alert_type === "ENTRY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {a.alert_type}
                </span>
                {!a.is_read && <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
              </div>
              <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                {a.alert_type === "ENTRY" ? "Entered" : "Exited"} <strong>{a.geofence_name}</strong>
                {a.notified_via && a.notified_via !== "none" && <> · Notified via <span className="text-cyan-400">{a.notified_via}</span></>}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{timeAgo(a.triggered_at)}
                </span>
                {a.lat && (
                  <a href={`https://maps.google.com/?q=${a.lat},${a.lng}`} target="_blank" rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                    <MapPin className="w-3 h-3" />View on map
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end justify-between self-stretch mt-1">
              {!a.is_read && (
                <button onClick={() => markRead(a.id)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap">
                  Mark read
                </button>
              )}
              <button onClick={() => handleDeleteAlert(a.id)}
                className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors mt-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!filtered.length && (
          <div className={`text-center py-16 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>No alerts match your filter.</div>
        )}
      </div>
    </div>
  );
}

/** AI Report view */
function AIView({ alerts, dark }) {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function generateReport() {
    setLoading(true);
    setError(null);
    setReport(null);
    const result = await apiFetch("/alerts/ai-report", { method: "POST" });
    if (result && !result.error && result.summary) {
      setReport(result);
    } else {
      setError(result?.error || "Failed to generate report from backend.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>AI Operations Report</h2>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>Powered by Gemini 1.5 Flash · Today's alerts summary</p>
        </div>
        <button onClick={generateReport} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-medium transition-all disabled:opacity-60">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing…</> : <><Zap className="w-4 h-4" />Generate Report</>}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border flex items-center gap-3 text-sm bg-red-500/10 border-red-500/20 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!report && !loading && !error && (
        <div className={`rounded-xl border-2 border-dashed p-16 text-center ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <Cpu className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-700" : "text-slate-300"}`} />
          <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>Click "Generate Report" to analyze today's geofence activity using AI</p>
        </div>
      )}

      {loading && (
        <div className={`rounded-xl border p-10 text-center ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin absolute inset-0" />
            <Cpu className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>AI is analyzing {alerts.length} alerts…</p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-4">
          {/* Summary card */}
          <div className={`rounded-xl border p-6 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Executive Summary</h3>
            </div>
            <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>{report.summary}</p>
          </div>

          {/* Suggestions */}
          <div className={`rounded-xl border p-6 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Recommended Actions</h3>
            </div>
            <div className="space-y-3">
              {(report.suggestions || []).map((s, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-lg ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}>
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className={`text-sm ${dark ? "text-slate-300" : "text-slate-700"}`}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          {report.anomalies && (
            <div className={`rounded-xl border border-orange-500/20 p-6 ${dark ? "bg-orange-500/5" : "bg-orange-50"}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-400">Anomalies & Flags</h3>
              </div>
              <p className={`text-sm ${dark ? "text-slate-300" : "text-slate-700"}`}>{report.anomalies}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Export view */
function ExportView({ alerts, devices, dark, clearLocationLogsInFirestore }) {
  const [clearing, setClearing] = useState(false);

  function downloadCSV() {
    exportCSV(alerts.map(a => ({
      ID:           a.id,
      Device:       a.device_name,
      DeviceID:     a.device_id,
      Geofence:     a.geofence_name,
      Type:         a.alert_type,
      Priority:     a.priority,
      Latitude:     a.lat,
      Longitude:    a.lng,
      NotifiedVia:  a.notified_via,
      Timestamp:    a.triggered_at,
      Read:         a.is_read,
    })));
  }

  async function downloadFromServer() {
    window.open(`${API}/export/alerts.csv`, "_blank");
  }

  async function handleClearLogs() {
    if (window.confirm("Are you sure you want to delete all location logs from the database? This action cannot be undone.")) {
      setClearing(true);
      await clearLocationLogsInFirestore();
      window.alert("All location logs have been successfully deleted.");
      setClearing(false);
    }
  }

  const cardCls = `rounded-xl border p-6 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`;

  return (
    <div className="space-y-5">
      <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>Export & Maintenance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CSV export */}
        <div className={cardCls}>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
            <FileDown className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className={`font-semibold text-sm mb-1 ${dark ? "text-white" : "text-slate-900"}`}>Alerts CSV Export</h3>
          <p className={`text-xs mb-4 ${dark ? "text-slate-500" : "text-slate-500"}`}>Download all {alerts.length} alerts as a CSV file for spreadsheet analysis.</p>
          <div className="flex gap-2">
            <button onClick={downloadCSV}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium transition-colors">
              Download (Local)
            </button>
            <button onClick={downloadFromServer}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors
                ${dark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
              Via Server API
            </button>
          </div>
        </div>

        {/* Device summary */}
        <div className={cardCls}>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className={`font-semibold text-sm mb-1 ${dark ? "text-white" : "text-slate-900"}`}>Device Status CSV</h3>
          <p className={`text-xs mb-4 ${dark ? "text-slate-500" : "text-slate-500"}`}>Export current status of all {devices.length} fleet devices with last seen time.</p>
          <button onClick={() => exportCSV(devices.map(d => ({
            ID: d.id, DeviceID: d.device_id, Name: d.name, Type: d.type,
            Status: d.status, Owner: d.owner_name, LastSeen: d.last_seen, Lat: d.last_lat, Lng: d.last_lng,
          })))}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium transition-colors">
            Download CSV
          </button>
        </div>

        {/* Database maintenance */}
        <div className={cardCls}>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h3 className={`font-semibold text-sm mb-1 ${dark ? "text-white" : "text-slate-900"}`}>Clear Location Logs</h3>
          <p className={`text-xs mb-4 ${dark ? "text-slate-500" : "text-slate-500"}`}>Permanently delete all historic location telemetry records from the database.</p>
          <button onClick={handleClearLogs} disabled={clearing}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-medium transition-colors disabled:opacity-50">
            {clearing ? "Clearing..." : "Clear Location Logs"}
          </button>
        </div>
      </div>

      {/* Summary table */}
      <div className={cardCls}>
        <h3 className={`font-semibold text-sm mb-4 ${dark ? "text-white" : "text-slate-900"}`}>Quick Stats Preview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Total Alerts",    value: alerts.length },
            { label: "Entries",         value: alerts.filter(a => a.alert_type === "ENTRY").length },
            { label: "Exits",           value: alerts.filter(a => a.alert_type === "EXIT").length },
            { label: "Critical Events", value: alerts.filter(a => a.priority === "critical").length },
          ].map(({ label, value }) => (
            <div key={label} className={`p-3 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-50"}`}>
              <p className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-500"}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulate device ping */}
      <div className={`rounded-xl border border-cyan-500/20 p-6 ${dark ? "bg-cyan-500/5" : "bg-cyan-50"}`}>
        <h3 className="text-sm font-semibold text-cyan-400 mb-2">🛰 Test: Simulate GPS Ping</h3>
        <p className={`text-xs mb-4 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          Send a test GPS coordinate to the backend. This simulates a real device checking in.
        </p>
        <SimulatePing dark={dark} />
      </div>
    </div>
  );
}

/** Simulate a device GPS ping to the backend */
function SimulatePing({ dark }) {
  const [form, setForm] = useState({ device_id: "TRUCK-001", lat: "17.3988", lng: "78.5538" });
  const [res,  setRes]  = useState(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setRes(null);
    const payload = {
      device_id: form.device_id,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
    };
    const result = await apiFetch("/location", { method: "POST", body: JSON.stringify(payload) });
    setRes(result || { error: "Connection error: check if backend server is running on :4000." });
    setBusy(false);
  }

  const inputCls = `px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50
    ${dark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input value={form.device_id} onChange={e => setForm(f=>({...f,device_id:e.target.value}))} placeholder="Device ID" className={inputCls} />
        <input value={form.lat}       onChange={e => setForm(f=>({...f,lat:e.target.value}))}       placeholder="Latitude"  className={inputCls} />
        <input value={form.lng}       onChange={e => setForm(f=>({...f,lng:e.target.value}))}       placeholder="Longitude" className={inputCls} />
        <button onClick={send} disabled={busy}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors disabled:opacity-50">
          {busy ? "Sending…" : "Send Ping"}
        </button>
      </div>
      {res && (
        <pre className={`text-xs p-3 rounded-lg overflow-x-auto ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
          {JSON.stringify(res, null, 2)}
        </pre>
      )}
    </div>
  );
}









// ─────────────────────────────────────────────
// AUTHENTICATION COMPONENT
// ─────────────────────────────────────────────
function LoginView({ onLogin, dark, setDark }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "srishanth" && password === "1234567890") {
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  // Floating badge data for background animation
  const floatingBadges = [
    { icon: Bell,           label: "ENTRY Alert",      color: "from-emerald-500 to-green-600",  glow: "shadow-emerald-500/30", x: "8%",  y: "12%", delay: 0,   dur: 6,  size: "w-10 h-10" },
    { icon: AlertTriangle,  label: "EXIT Warning",     color: "from-rose-500 to-red-600",       glow: "shadow-rose-500/30",    x: "82%", y: "18%", delay: 1.2, dur: 7,  size: "w-9 h-9"  },
    { icon: MapPin,         label: "Zone Breach",      color: "from-amber-500 to-orange-600",   glow: "shadow-amber-500/30",   x: "15%", y: "75%", delay: 0.6, dur: 8,  size: "w-8 h-8"  },
    { icon: Truck,          label: "Vehicle Moving",   color: "from-blue-500 to-indigo-600",    glow: "shadow-blue-500/30",    x: "78%", y: "72%", delay: 2,   dur: 5,  size: "w-10 h-10" },
    { icon: Shield,         label: "Perimeter Secured",color: "from-cyan-500 to-teal-600",      glow: "shadow-cyan-500/30",    x: "5%",  y: "45%", delay: 0.3, dur: 9,  size: "w-8 h-8"  },
    { icon: Zap,            label: "Critical",         color: "from-purple-500 to-violet-600",  glow: "shadow-purple-500/30",  x: "90%", y: "48%", delay: 1.8, dur: 6,  size: "w-9 h-9"  },
    { icon: Activity,       label: "Live Tracking",    color: "from-teal-500 to-cyan-600",      glow: "shadow-teal-500/30",    x: "45%", y: "8%",  delay: 0.9, dur: 7,  size: "w-8 h-8"  },
    { icon: Wifi,           label: "Connected",        color: "from-sky-500 to-blue-600",       glow: "shadow-sky-500/30",     x: "50%", y: "88%", delay: 1.5, dur: 8,  size: "w-8 h-8"  },
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-300 relative overflow-hidden ${dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>

      {/* ── Animated grid background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${dark ? "opacity-[0.03]" : "opacity-[0.04]"}`}
          style={{
            backgroundImage: `radial-gradient(circle, ${dark ? "#22d3ee" : "#0891b2"} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Radial glow behind login card ── */}
      <div className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/5" : "bg-cyan-400/10"}`} />

      {/* ── Floating bouncing alert badges ── */}
      {floatingBadges.map((badge, i) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{ left: badge.x, top: badge.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.85, 0.85, 0],
              scale: [0.6, 1, 1, 0.6],
              y: [0, -18, 18, 0],
              x: [0, 8, -8, 0],
              rotate: [0, 6, -6, 0],
            }}
            transition={{
              duration: badge.dur,
              repeat: Infinity,
              delay: badge.delay,
              ease: "easeInOut",
            }}
          >
            <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-br ${badge.color} shadow-xl ${badge.glow} backdrop-blur-sm border border-white/10`}>
              <div className={`${badge.size} rounded-lg bg-white/20 flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-white/90 whitespace-nowrap">{badge.label}</p>
                <p className="text-[8px] text-white/50 font-mono">
                  {new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ── Orbiting ring particles ── */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className={`absolute w-2 h-2 rounded-full pointer-events-none ${
            i === 0 ? "bg-cyan-400" : i === 1 ? "bg-emerald-400" : "bg-purple-400"
          }`}
          style={{ left: "50%", top: "50%" }}
          animate={{
            x: [
              Math.cos(0) * (150 + i * 60),
              Math.cos(Math.PI * 0.5) * (150 + i * 60),
              Math.cos(Math.PI) * (150 + i * 60),
              Math.cos(Math.PI * 1.5) * (150 + i * 60),
              Math.cos(Math.PI * 2) * (150 + i * 60),
            ],
            y: [
              Math.sin(0) * (100 + i * 40),
              Math.sin(Math.PI * 0.5) * (100 + i * 40),
              Math.sin(Math.PI) * (100 + i * 40),
              Math.sin(Math.PI * 1.5) * (100 + i * 40),
              Math.sin(Math.PI * 2) * (100 + i * 40),
            ],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* ── Dark/Light toggle ── */}
      <button 
        onClick={() => setDark(!dark)}
        className={`absolute top-4 right-4 z-20 p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-900 text-slate-400" : "hover:bg-slate-200 text-slate-600"}`}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* ── Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-md p-8 rounded-2xl border shadow-2xl backdrop-blur-xl transition-colors duration-300 ${
          dark 
            ? "bg-slate-900/70 border-slate-800 shadow-slate-950/50" 
            : "bg-white/80 border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3"
          >
            <Shield className="w-7 h-7 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold tracking-tight">Access Control</h2>
          <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Please authenticate to access the Geofence Dashboard
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: [0, -4, 4, -4, 4, 0] }}
            transition={{ x: { duration: 0.4 } }}
            className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold uppercase mb-1.5 ${dark ? "text-slate-400" : "text-slate-600"}`}>
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                  dark
                    ? "bg-slate-950 border-slate-800 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase mb-1.5 ${dark ? "text-slate-400" : "text-slate-600"}`}>
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                  dark
                    ? "bg-slate-950 border-slate-800 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-2 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/30 cursor-pointer"
          >
            Authenticate
          </motion.button>
        </form>
      </motion.div>

      {/* ── Footer branding ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={`absolute bottom-4 text-[10px] font-mono ${dark ? "text-slate-700" : "text-slate-300"}`}
      >
        GeoFence Alert System v1.0
      </motion.p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("geofence_auth") === "true";
  });
  const [activeView,  setActiveView]  = useState("dashboard");
  const [dark,        setDark]        = useState(true);
  const [collapsed,   setCollapsed]   = useState(false);
  const [devices,     setDevices]     = useState([]);
  const [geofences,   setGeofences]   = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [online,      setOnline]      = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // If Firestore isn't available, mark offline
    if (!db) {
      setOnline(false);
      return;
    }

    let unsubDevices = () => {};
    let unsubGeofences = () => {};
    let unsubAlerts = () => {};

    try {
      unsubDevices = onSnapshot(
        collection(db, 'devices'),
        snap => {
          setDevices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLastRefresh(new Date());
        }
      );

      unsubGeofences = onSnapshot(
        collection(db, 'geofences'),
        snap => {
          setGeofences(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLastRefresh(new Date());
        }
      );

      unsubAlerts = onSnapshot(
        query(collection(db, 'alerts'), orderBy('triggered_at', 'desc'), limit(100)),
        snap => {
          setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLastRefresh(new Date());
        }
      );

      setOnline(true);
    } catch (err) {
      console.error('Firestore listeners failed to start:', err);
      setOnline(false);
    }

    return () => {
      try { unsubDevices(); } catch {}
      try { unsubGeofences(); } catch {}
      try { unsubAlerts(); } catch {}
    };
  }, []);

  // Firestore write functions
  async function addDeviceToFirestore(deviceData) {
    try {
      const docRef = await addDoc(collection(db, 'devices'), {
        ...deviceData,
        status: 'unknown',
        last_seen: new Date().toISOString(),
        last_lat: null,
        last_lng: null,
        created_at: serverTimestamp(),
      });
      
      // Sync with the backend server to register the device and trigger the email notification
      await apiFetch("/devices", {
        method: "POST",
        body: JSON.stringify(deviceData),
      });

      return { id: docRef.id, ...deviceData };
    } catch (error) {
      console.error('Error adding device:', error);
      return null;
    }
  }

  async function deleteDeviceFromFirestore(id) {
    try {
      await deleteDoc(doc(db, 'devices', id));
      await apiFetch(`/devices/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  }

  async function deleteGeofenceFromFirestore(id) {
    try {
      await deleteDoc(doc(db, 'geofences', id));
      await apiFetch(`/geofences/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error('Error deleting geofence:', error);
    }
  }

  async function deleteAlertFromFirestore(id) {
    try {
      await deleteDoc(doc(db, 'alerts', id));
      await apiFetch(`/alerts/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }

  async function clearLocationLogsInFirestore() {
    try {
      await apiFetch(`/location/logs`, { method: "DELETE" });
    } catch (error) {
      console.error('Error clearing location logs:', error);
    }
  }

  async function addGeofenceToFirestore(geofenceData) {
    try {
      const docRef = await addDoc(collection(db, 'geofences'), {
        ...geofenceData,
        is_active: true,
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...geofenceData, is_active: true };
    } catch (error) {
      console.error('Error adding geofence:', error);
      return null;
    }
  }

  async function updateGeofenceInFirestore(id, data) {
    try {
      await updateDoc(doc(db, 'geofences', id), data);
    } catch (error) {
      console.error('Error updating geofence:', error);
    }
  }

  async function markAlertAsReadInFirestore(id) {
    try {
      await updateDoc(doc(db, 'alerts', id), { is_read: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const views = {
    dashboard: <DashboardView devices={devices} alerts={alerts} dark={dark} markAlertAsReadInFirestore={markAlertAsReadInFirestore} deleteAlertFromFirestore={deleteAlertFromFirestore} />,
    devices:   <DevicesView   devices={devices} setDevices={setDevices} dark={dark} addDeviceToFirestore={addDeviceToFirestore} deleteDeviceFromFirestore={deleteDeviceFromFirestore} />,
    geofences: <GeofencesView geofences={geofences} setGeofences={setGeofences} dark={dark} addGeofenceToFirestore={addGeofenceToFirestore} updateGeofenceInFirestore={updateGeofenceInFirestore} deleteGeofenceFromFirestore={deleteGeofenceFromFirestore} />,
    alerts:    <AlertsView    alerts={alerts} setAlerts={setAlerts} dark={dark} markAlertAsReadInFirestore={markAlertAsReadInFirestore} deleteAlertFromFirestore={deleteAlertFromFirestore} />,
    ai:        <AIView        alerts={alerts} dark={dark} />,
    export:    <ExportView    alerts={alerts} devices={devices} dark={dark} clearLocationLogsInFirestore={clearLocationLogsInFirestore} />,
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={() => {
          localStorage.setItem("geofence_auth", "true");
          setIsAuthenticated(true);
        }}
        dark={dark}
        setDark={setDark}
      />
    );
  }

  return (
    <div className={`flex min-h-screen ${dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <Sidebar
        active={activeView} setActive={setActiveView}
        dark={dark} toggleDark={() => setDark(d => !d)}
        collapsed={collapsed} setCollapsed={setCollapsed}
        onLogout={() => {
          localStorage.removeItem("geofence_auth");
          setIsAuthenticated(false);
        }}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 flex items-center gap-4 px-6 py-4 border-b
          ${dark ? "bg-slate-950/90 border-slate-800 backdrop-blur-sm" : "bg-white/90 border-slate-200 backdrop-blur-sm"}`}>

          {/* Breadcrumb */}
          <div>
            <h1 className={`text-base font-semibold capitalize ${dark ? "text-white" : "text-slate-900"}`}>
              {activeView === "ai" ? "AI Report" : activeView}
            </h1>
            <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
              Refreshed {timeAgo(lastRefresh)}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Connection status */}
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border
              ${online
                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                : "text-slate-400 border-slate-500/20 bg-slate-500/10"}`}>
              {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {online ? "Live" : "Offline"}
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <button onClick={() => setActiveView("alerts")}
                className="relative flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 transition-colors hover:bg-rose-500/20">
                <motion.div
                  animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 3.5 }}
                >
                  <Bell className="w-3 h-3" />
                </motion.div>
                {unreadCount} unread
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
              </button>
            )}

            {/* Refresh — Real-time listeners active */}
            <button disabled
              className={`p-2 rounded-lg transition-colors opacity-50 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              {views[activeView]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className={`px-6 py-3 border-t text-xs flex items-center justify-between
          ${dark ? "border-slate-800 text-slate-600" : "border-slate-200 text-slate-400"}`}>
          <span>Geofence Alert System</span>
          <span>{devices.length} devices · {geofences.filter(g=>g.is_active).length} active zones · {alerts.length} alerts logged</span>
        </footer>
      </main>
    </div>
  );
}
