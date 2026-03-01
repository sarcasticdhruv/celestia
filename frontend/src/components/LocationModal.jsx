import { useState, useEffect } from 'react'
import StarField from './StarField.jsx'

const CITIES = [
  { name: 'New Delhi',      lat: 28.6139,  lon: 77.2090,  country: 'IN' },
  { name: 'London',         lat: 51.5074,  lon: -0.1278,  country: 'GB' },
  { name: 'New York',       lat: 40.7128,  lon: -74.0060, country: 'US' },
  { name: 'Tokyo',          lat: 35.6762,  lon: 139.6503, country: 'JP' },
  { name: 'Sydney',         lat: -33.8688, lon: 151.2093, country: 'AU' },
  { name: 'Paris',          lat: 48.8566,  lon: 2.3522,   country: 'FR' },
  { name: 'Cairo',          lat: 30.0444,  lon: 31.2357,  country: 'EG' },
  { name: 'São Paulo',      lat: -23.5505, lon: -46.6333, country: 'BR' },
  { name: 'Nairobi',        lat: -1.2921,  lon: 36.8219,  country: 'KE' },
  { name: 'Moscow',         lat: 55.7558,  lon: 37.6173,  country: 'RU' },
  { name: 'Dubai',          lat: 25.2048,  lon: 55.2708,  country: 'AE' },
  { name: 'Los Angeles',    lat: 34.0522,  lon: -118.2437,country: 'US' },
  { name: 'Buenos Aires',   lat: -34.6037, lon: -58.3816, country: 'AR' },
  { name: 'Beijing',        lat: 39.9042,  lon: 116.4074, country: 'CN' },
  { name: 'Cape Town',      lat: -33.9249, lon: 18.4241,  country: 'ZA' },
  { name: 'Mexico City',    lat: 19.4326,  lon: -99.1332, country: 'MX' },
  { name: 'Berlin',         lat: 52.5200,  lon: 13.4050,  country: 'DE' },
  { name: 'Seoul',          lat: 37.5665,  lon: 126.9780, country: 'KR' },
  { name: 'Mumbai',         lat: 19.0760,  lon: 72.8777,  country: 'IN' },
  { name: 'Singapore',      lat: 1.3521,   lon: 103.8198, country: 'SG' },
]

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse at 50% 40%, #071428 0%, #00010a 70%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, overflow: 'hidden',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(3.5rem, 8vw, 7rem)',
    fontWeight: 300,
    letterSpacing: '0.25em',
    color: 'var(--white)',
    textAlign: 'center',
    lineHeight: 1,
    marginBottom: '0.2em',
    animation: 'glow-pulse 4s ease-in-out infinite',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(0.6rem, 1.2vw, 0.75rem)',
    letterSpacing: '0.4em',
    color: 'var(--glow)',
    textTransform: 'uppercase',
    marginBottom: '3.5rem',
    animation: 'fadeIn 1s 0.4s ease forwards',
    animationFillMode: 'both',
    opacity: 0,
  },
  tagline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
    fontWeight: 300,
    fontStyle: 'italic',
    color: 'var(--frost)',
    marginBottom: '3rem',
    animation: 'fadeIn 1s 0.7s ease forwards',
    animationFillMode: 'both',
    opacity: 0,
    textAlign: 'center',
  },
  card: {
    background: 'rgba(7,20,40,0.75)',
    border: '1px solid rgba(59,130,246,0.2)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: 'min(480px, 92vw)',
    animation: 'slide-up 1s 0.9s ease forwards',
    animationFillMode: 'both',
    opacity: 0,
    boxShadow: '0 0 80px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    letterSpacing: '0.3em',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  btn: {
    width: '100%',
    padding: '0.9rem 1.5rem',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '10px',
    color: 'var(--frost)',
    fontFamily: 'var(--font-serif)',
    fontSize: '1.05rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    marginBottom: '0.75rem',
    textAlign: 'left',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    margin: '1.2rem 0',
    color: 'var(--dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
  },
  searchWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '10px',
    padding: '0.85rem 1rem 0.85rem 2.8rem',
    color: 'var(--white)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  searchIcon: {
    position: 'absolute', left: '0.9rem', top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--muted)', fontSize: '0.9rem', pointerEvents: 'none',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: 'rgba(4,9,22,0.97)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '10px', maxHeight: '220px', overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 20px 40px rgba(0,0,5,0.8)',
  },
  dropItem: {
    padding: '0.65rem 1rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'background 0.15s',
  },
  locPulse: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'var(--glow)',
    animation: 'pulse-ring 1.5s infinite',
    flexShrink: 0,
  },
}

export default function LocationModal({ onLocation }) {
  const [phase,   setPhase]   = useState('intro')   // intro | select
  const [query,   setQuery]   = useState('')
  const [loading, setLoading] = useState(false)
  const [filtered, setFiltered] = useState([])
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setPhase('select'), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setFiltered([]); return }
    const q = query.toLowerCase()
    setFiltered(CITIES.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6))
  }, [query])

  const pick = (loc) => onLocation({ lat: loc.lat, lon: loc.lon, name: loc.name })

  const useGeo = () => {
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        onLocation({ lat, lon, name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` })
      },
      () => { setError('Location access denied. Please choose a city.'); setLoading(false) }
    )
  }

  const useManual = () => {
    const lat = parseFloat(manualLat), lon = parseFloat(manualLon)
    if (isNaN(lat)||isNaN(lon)||lat<-90||lat>90||lon<-180||lon>180)
      { setError('Enter valid latitude (−90 to 90) and longitude (−180 to 180).'); return }
    onLocation({ lat, lon, name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` })
  }

  return (
    <div style={styles.overlay}>
      <StarField count={300} />

      {/* Decorative ring */}
      <div style={{
        position: 'absolute', width: 520, height: 520,
        borderRadius: '50%', border: '1px solid rgba(59,130,246,0.06)',
        animation: 'rotate-slow 60s linear infinite', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', width: 700, height: 700,
        borderRadius: '50%', border: '1px solid rgba(59,130,246,0.04)',
        animation: 'rotate-slow 90s linear infinite reverse', pointerEvents: 'none',
      }}/>

      {/* Title always visible */}
      <h1 style={styles.title}>CELESTIA</h1>
      <p style={styles.subtitle}>Your Personal Planetarium</p>
      <p style={styles.tagline}>
        {phase === 'intro' ? 'The universe, calculated for you…' : 'Where are you observing from?'}
      </p>

      {phase === 'select' && (
        <div style={styles.card}>

          {/* GPS */}
          <p style={styles.sectionLabel}>Detect automatically</p>
          {navigator.geolocation ? (
            <button
              style={{ ...styles.btn, ...(loading ? { opacity: 0.6, pointerEvents: 'none' } : {}) }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.18)'; e.currentTarget.style.borderColor='rgba(59,130,246,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(59,130,246,0.1)';  e.currentTarget.style.borderColor='rgba(59,130,246,0.3)' }}
              onClick={useGeo}
            >
              {loading
                ? <><span style={styles.locPulse}/> Locating…</>
                : <><span style={{ fontSize:'1.1rem' }}>◎</span> Use my current location</>
              }
            </button>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>Geolocation not available in this browser.</p>
          )}

          {/* Divider */}
          <div style={styles.divider}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
            <span>or search</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
          </div>

          {/* City search */}
          <p style={styles.sectionLabel}>Search a city</p>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>✦</span>
            <input
              style={styles.input}
              placeholder="London, Tokyo, Mumbai…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={e => { e.target.style.borderColor='rgba(59,130,246,0.5)' }}
              onBlur={e => { e.target.style.borderColor='rgba(59,130,246,0.2)' }}
              autoFocus
            />
            {filtered.length > 0 && (
              <div style={styles.dropdown}>
                {filtered.map(c => (
                  <div key={c.name} style={styles.dropItem}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    onClick={() => pick(c)}
                  >
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--pale)' }}>{c.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing:'0.1em' }}>{c.country}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick city grid */}
          <div style={{ marginTop: '1.2rem' }}>
            <p style={styles.sectionLabel}>Popular locations</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CITIES.slice(0,12).map(c => (
                <button key={c.name}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', cursor: 'pointer',
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.12)'; e.currentTarget.style.color='var(--frost)'; e.currentTarget.style.borderColor='rgba(59,130,246,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}
                  onClick={() => pick(c)}
                >{c.name}</button>
              ))}
            </div>
          </div>

          {/* Manual coordinates */}
          <button
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:'0.6rem', letterSpacing:'0.15em', marginTop:'1.2rem', textDecoration:'underline', display:'block', textTransform:'uppercase' }}
            onClick={() => setShowManual(v => !v)}
          >Enter coordinates manually</button>

          {showManual && (
            <div style={{ marginTop:'0.75rem', display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
              <input style={{ ...styles.input, width:'45%', padding:'0.6rem 0.8rem' }}
                placeholder="Latitude" value={manualLat} onChange={e => setManualLat(e.target.value)} />
              <input style={{ ...styles.input, width:'45%', padding:'0.6rem 0.8rem' }}
                placeholder="Longitude" value={manualLon} onChange={e => setManualLon(e.target.value)} />
              <button style={{ ...styles.btn, marginBottom:0, padding:'0.6rem 1rem', fontSize:'0.8rem' }}
                onClick={useManual}>Go</button>
            </div>
          )}

          {error && (
            <p style={{ color:'#f87171', fontFamily:'var(--font-mono)', fontSize:'0.7rem', marginTop:'0.75rem' }}>
              ⚠ {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
