import { useState } from 'react'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      const res = await API.post('/auth/login', form)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('plan', res.data.plan)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>RateLimiter</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button style={styles.button} onClick={handleSubmit}>Login</button>
        <p style={styles.link} onClick={() => navigate('/register')}>
          No account? Register
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f0f' },
  card: { background: '#1a1a1a', padding: '40px', borderRadius: '12px', width: '360px', display: 'flex', flexDirection: 'column', gap: '16px' },
  title: { color: '#fff', margin: 0, fontSize: '22px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '14px' },
  button: { padding: '12px', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '15px' },
  error: { color: '#f87171', fontSize: '13px', margin: 0 },
  link: { color: '#6366f1', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }
}
