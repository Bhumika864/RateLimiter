// import { useState, useEffect } from 'react'
// import API from '../api/axios'
// import { useNavigate } from 'react-router-dom'
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// export default function Dashboard() {
//   const [keys, setKeys] = useState([])
//   const [keyName, setKeyName] = useState('')
//   const [newKey, setNewKey] = useState(null)
//   const [analytics, setAnalytics] = useState(null)
//   const [selectedPrefix, setSelectedPrefix] = useState('')
//   const navigate = useNavigate()
//   const plan = localStorage.getItem('plan')

//   const fetchKeys = async () => {
//     const res = await API.get('/keys/list')
//     setKeys(res.data)
//   }

//   useEffect(() => { fetchKeys() }, [])

//   const generateKey = async () => {
//     if (!keyName) return
//     const res = await API.post('/keys/generate', { name: keyName })
//     setNewKey(res.data.key)
//     setKeyName('')
//     fetchKeys()
//   }

//   const deactivateKey = async (id) => {
//     await API.delete(`/keys/${id}`)
//     fetchKeys()
//   }

//   const fetchAnalytics = async (prefix) => {
//     setSelectedPrefix(prefix)
//     const res = await API.get(`/analytics/summary/${prefix}`)
//     setAnalytics(res.data)
//   }

//   const logout = () => {
//     localStorage.clear()
//     navigate('/login')
//   }

//   const chartData = analytics ? [
//     { name: 'Allowed', value: analytics.allowed },
//     { name: 'Blocked', value: analytics.blocked },
//     { name: 'Window Usage', value: analytics.currentWindowUsage }
//   ] : []

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h2 style={styles.title}>RateLimiter Dashboard</h2>
//         <div style={styles.headerRight}>
//           <span style={styles.plan}>{plan} plan</span>
//           <button style={styles.logout} onClick={logout}>Logout</button>
//         </div>
//       </div>

//       <div style={styles.section}>
//         <h3 style={styles.sectionTitle}>Generate API Key</h3>
//         <div style={styles.row}>
//           <input
//             style={styles.input}
//             placeholder="Key name"
//             value={keyName}
//             onChange={e => setKeyName(e.target.value)}
//           />
//           <button style={styles.button} onClick={generateKey}>Generate</button>
//         </div>
//         {newKey && (
//           <div style={styles.keyBox}>
//             <p style={styles.keyLabel}>Your key — save it now, won't show again:</p>
//             <code style={styles.keyText}>{newKey}</code>
//           </div>
//         )}
//       </div>

//       <div style={styles.section}>
//         <h3 style={styles.sectionTitle}>Your API Keys</h3>
//         {keys.length === 0 && <p style={styles.muted}>No keys yet</p>}
//         {keys.map(k => (
//           <div key={k._id} style={styles.keyRow}>
//             <div>
//               <p style={styles.keyName}>{k.name}</p>
//               <p style={styles.keyMeta}>Prefix: {k.keyPrefix} · Plan: {k.plan} · {k.isActive ? '✓ Active' : '✗ Inactive'}</p>
//             </div>
//             <div style={styles.keyActions}>
//               <button style={styles.smallBtn} onClick={() => fetchAnalytics(k.keyPrefix)}>Analytics</button>
//               <button style={{ ...styles.smallBtn, background: '#dc2626' }} onClick={() => deactivateKey(k._id)}>Deactivate</button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {analytics && (
//         <div style={styles.section}>
//           <h3 style={styles.sectionTitle}>Analytics — {selectedPrefix}</h3>
//           <div style={styles.statsRow}>
//             <div style={styles.stat}><p style={styles.statNum}>{analytics.total}</p><p style={styles.statLabel}>Total</p></div>
//             <div style={styles.stat}><p style={{ ...styles.statNum, color: '#4ade80' }}>{analytics.allowed}</p><p style={styles.statLabel}>Allowed</p></div>
//             <div style={styles.stat}><p style={{ ...styles.statNum, color: '#f87171' }}>{analytics.blocked}</p><p style={styles.statLabel}>Blocked</p></div>
//             <div style={styles.stat}><p style={{ ...styles.statNum, color: '#facc15' }}>{analytics.currentWindowUsage}</p><p style={styles.statLabel}>Window Usage</p></div>
//           </div>
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" stroke="#888" />
//               <YAxis stroke="#888" />
//               <Tooltip />
//               <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   )
// }

// const styles = {
//   container: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '32px', fontFamily: 'sans-serif' },
//   header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
//   headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
//   title: { margin: 0, fontSize: '22px' },
//   plan: { background: '#6366f1', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' },
//   logout: { background: 'transparent', border: '1px solid #444', color: '#fff', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' },
//   section: { background: '#1a1a1a', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
//   sectionTitle: { margin: '0 0 16px', fontSize: '16px', color: '#a3a3a3' },
//   row: { display: 'flex', gap: '12px' },
//   input: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '14px' },
//   button: { padding: '10px 20px', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' },
//   keyBox: { marginTop: '16px', background: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #333' },
//   keyLabel: { margin: '0 0 8px', color: '#a3a3a3', fontSize: '13px' },
//   keyText: { color: '#4ade80', fontSize: '13px', wordBreak: 'break-all' },
//   keyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#111', borderRadius: '8px', marginBottom: '8px' },
//   keyName: { margin: 0, fontSize: '15px' },
//   keyMeta: { margin: '4px 0 0', fontSize: '12px', color: '#666' },
//   keyActions: { display: 'flex', gap: '8px' },
//   smallBtn: { padding: '6px 14px', borderRadius: '6px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' },
//   statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
//   stat: { flex: 1, background: '#111', borderRadius: '8px', padding: '16px', textAlign: 'center' },
//   statNum: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
//   statLabel: { margin: '4px 0 0', color: '#666', fontSize: '13px' },
//   muted: { color: '#666', fontSize: '14px' }
// }

import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [keys, setKeys] = useState([]);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const navigate = useNavigate();
  const plan = localStorage.getItem("plan");

  const fetchKeys = async () => {
    const res = await API.get("/keys/list");
    setKeys(res.data.filter((k) => k.isActive));
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const generateKey = async () => {
    if (!keyName) return;
    const res = await API.post("/keys/generate", { name: keyName });
    setNewKey(res.data.key);
    setKeyName("");
    fetchKeys();
  };

  const deactivateKey = async (id) => {
    await API.delete(`/keys/${id}`);
    fetchKeys();
  };

  const fetchAnalytics = async (prefix) => {
    setSelectedPrefix(prefix);
    const res = await API.get(`/analytics/summary/${prefix}`);
    setAnalytics(res.data);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const chartData = analytics
    ? [
        { name: "Allowed", value: analytics.allowed },
        { name: "Blocked", value: analytics.blocked },
        { name: "Window Usage", value: analytics.currentWindowUsage },
      ]
    : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>RateLimiter Dashboard</h2>
        <div style={styles.headerRight}>
          <span style={styles.plan}>{plan} plan</span>
          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.planBanner}>
        <span>
          Current plan: <strong>{plan}</strong>
        </span>
        <span style={styles.planDetail}>
          {plan === "pro" ? "1000 requests/min" : "100 requests/min"} · Auto-ban
          after 5 violations
        </span>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Generate API Key</h3>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Key name"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
          />
          <button style={styles.button} onClick={generateKey}>
            Generate
          </button>
        </div>
        {newKey && (
          <div style={styles.keyBox}>
            <p style={styles.keyLabel}>
              Your key — save it now, won't show again:
            </p>
            <code style={styles.keyText}>{newKey}</code>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Your API Keys</h3>
        {keys.length === 0 && <p style={styles.muted}>No active keys</p>}
        {keys.map((k) => (
          <div key={k._id} style={styles.keyRow}>
            <div>
              <p style={styles.keyName}>{k.name}</p>
              <p style={styles.keyMeta}>
                Prefix: {k.keyPrefix} · Plan: {k.plan} · ✓ Active
              </p>
            </div>
            <div style={styles.keyActions}>
              <button
                style={styles.smallBtn}
                onClick={() => fetchAnalytics(k.keyPrefix)}
              >
                Analytics
              </button>
              <button
                style={{ ...styles.smallBtn, background: "#dc2626" }}
                onClick={() => deactivateKey(k._id)}
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {analytics && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Analytics — {selectedPrefix}</h3>
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <p style={styles.statNum}>{analytics.total}</p>
              <p style={styles.statLabel}>Total</p>
            </div>
            <div style={styles.stat}>
              <p style={{ ...styles.statNum, color: "#4ade80" }}>
                {analytics.allowed}
              </p>
              <p style={styles.statLabel}>Allowed</p>
            </div>
            <div style={styles.stat}>
              <p style={{ ...styles.statNum, color: "#f87171" }}>
                {analytics.blocked}
              </p>
              <p style={styles.statLabel}>Blocked</p>
            </div>
            <div style={styles.stat}>
              <p style={{ ...styles.statNum, color: "#facc15" }}>
                {analytics.currentWindowUsage}
              </p>
              <p style={styles.statLabel}>Window Usage</p>
            </div>
            <div style={styles.stat}>
              <p style={{ ...styles.statNum, color: "#818cf8" }}>
                {plan === "pro" ? "1000" : "100"}
              </p>
              <p style={styles.statLabel}>Limit / min</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    padding: "32px",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  title: { margin: 0, fontSize: "22px" },
  plan: {
    background: "#6366f1",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
  },
  logout: {
    background: "transparent",
    border: "1px solid #444",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  planBanner: {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "16px 24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #6366f1",
  },
  planDetail: { color: "#a3a3a3", fontSize: "13px" },
  section: {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },
  sectionTitle: { margin: "0 0 16px", fontSize: "16px", color: "#a3a3a3" },
  row: { display: "flex", gap: "12px" },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    fontSize: "14px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  keyBox: {
    marginTop: "16px",
    background: "#111",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #333",
  },
  keyLabel: { margin: "0 0 8px", color: "#a3a3a3", fontSize: "13px" },
  keyText: { color: "#4ade80", fontSize: "13px", wordBreak: "break-all" },
  keyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#111",
    borderRadius: "8px",
    marginBottom: "8px",
  },
  keyName: { margin: 0, fontSize: "15px" },
  keyMeta: { margin: "4px 0 0", fontSize: "12px", color: "#666" },
  keyActions: { display: "flex", gap: "8px" },
  smallBtn: {
    padding: "6px 14px",
    borderRadius: "6px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
  },
  statsRow: { display: "flex", gap: "16px", marginBottom: "24px" },
  stat: {
    flex: 1,
    background: "#111",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
  },
  statNum: { margin: 0, fontSize: "28px", fontWeight: "bold" },
  statLabel: { margin: "4px 0 0", color: "#666", fontSize: "13px" },
  muted: { color: "#666", fontSize: "14px" },
};
