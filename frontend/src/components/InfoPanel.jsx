import { useState, useEffect } from 'react'

const s = {
  panel: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 220, background: 'rgba(2,4,14,0.82)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(59,130,246,0.1)',
    display: 'flex', flexDirection: 'column',
    padding: '1.5rem 0', overflowY: 'auto',
    zIndex: 10,
    animation: 'fadeIn 0.6s ease',
  },
  logo: {
    fontFamily: 'var(--font-serif)', fontWeight: 300,
    fontSize: '1.3rem', letterSpacing: '0.35em',
    color: 'var(--white)', padding: '0 1.2rem',
    marginBottom: '0.3rem',
    animation: 'glow-pulse 4s ease-in-out infinite',
  },
  locName: {
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
    letterSpacing: '0.2em', color: 'var(--glow)',
    padding: '0 1.2rem', marginBottom: '1.5rem',
    opacity: 0.7, textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  section: {
    padding: '1rem 1.2rem',
    borderTop: '1px solid rgba(59,130,246,0.08)',
  },
  sLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
    letterSpacing: '0.3em', color: 'var(--dim)',
    textTransform: 'uppercase', marginBottom: '0.8rem',
  },
  moonPhase: {
    display: 'flex', alignItems: 'center', gap: '0.8rem',
    marginBottom: '0.5rem',
  },
  moonDisc: (phase) => ({
    width: 36, height: 36, borderRadius: '50%',
    background: `radial-gradient(circle at ${30 + phase*40}% 50%, #f5f0c8 30%, #1a2040 70%)`,
    border: '1px solid rgba(245,240,200,0.2)',
    flexShrink: 0,
  }),
  moonName: {
    fontFamily: 'var(--font-serif)', fontSize: '0.9rem',
    color: 'var(--pale)', lineHeight: 1.3,
  },
  moonPct: {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    color: 'var(--muted)',
  },
  row: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '0.45rem',
  },
  rowKey: {
    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
    color: 'var(--muted)', letterSpacing: '0.1em',
  },
  rowVal: {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    color: 'var(--frost)',
  },
  timeBlock: {
    fontFamily: 'var(--font-mono)',
    padding: '0 1.2rem', marginBottom: '0.3rem',
  },
  timeBig: {
    fontSize: '1.6rem', color: 'var(--white)',
    letterSpacing: '0.1em', lineHeight: 1,
  },
  timeDate: {
    fontSize: '0.62rem', color: 'var(--muted)',
    letterSpacing: '0.2em', marginTop: '0.2rem',
  },
  dot: (vis) => ({
    width: 6, height: 6, borderRadius: '50%',
    background: vis ? '#4ade80' : '#64748b',
    flexShrink: 0,
  }),
  planetRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginBottom: '0.4rem',
  },
  planetColor: (color) => ({
    width: 7, height: 7, borderRadius: '50%',
    background: color, flexShrink: 0,
  }),
  statBadge: {
    display: 'inline-flex', alignItems:'center', gap:'0.3rem',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 6, padding: '0.2rem 0.5rem',
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
    color: 'var(--frost)', marginRight:'0.3rem', marginBottom:'0.3rem',
  },
  btn: {
    padding: '0.4rem 0.8rem',
    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 8, cursor: 'pointer',
    color: 'var(--frost)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
    letterSpacing: '0.1em', transition: 'all 0.15s',
  },
}

function now_time() {
  const d = new Date()
  return {
    time: d.toLocaleTimeString('en-GB', { hour12:false, hour:'2-digit', minute:'2-digit' }),
    date: d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
  }
}

export default function InfoPanel({ data, location, onLocationReset }) {
  const [tick, setTick] = useState(now_time())
  // Update clock every minute
  useEffect(() => {
    const id = setInterval(() => setTick(now_time()), 30000)
    return () => clearInterval(id)
  }, [])

  const moon   = data?.moon
  const sun    = data?.sun
  const stars  = data?.stars?.length ?? 0
  const dsoVis = data?.dso?.length ?? 0
  const planets = data?.planets ?? []

  return (
    <div style={s.panel}>

      {/* Logo + location */}
      <div style={s.logo}>CELESTIA</div>
      <div style={s.locName}>
        <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--glow)',display:'inline-block',flexShrink:0 }}/>
        {location?.name || '—'}
      </div>

      {/* Time */}
      <div style={s.timeBlock}>
        <div style={s.timeBig}>{tick.time}</div>
        <div style={s.timeDate}>{tick.date} — LOCAL</div>
      </div>

      {/* Stats quick badges */}
      <div style={{ padding:'0.75rem 1.2rem', display:'flex', flexWrap:'wrap' }}>
        <span style={s.statBadge}>✦ {stars} stars</span>
        <span style={s.statBadge}>◎ {dsoVis} DSO</span>
      </div>

      {/* Moon */}
      {moon && (
        <div style={s.section}>
          <div style={s.sLabel}>Moon</div>
          <div style={s.moonPhase}>
            <div style={s.moonDisc(moon.phase)} />
            <div>
              <div style={s.moonName}>{moon.phase_name}</div>
              <div style={s.moonPct}>{moon.illumination}% lit</div>
            </div>
          </div>
          {moon.visible && (
            <>
              <div style={s.row}>
                <span style={s.rowKey}>Altitude</span>
                <span style={s.rowVal}>{moon.alt.toFixed(1)}°</span>
              </div>
              <div style={s.row}>
                <span style={s.rowKey}>Azimuth</span>
                <span style={s.rowVal}>{moon.az.toFixed(1)}°</span>
              </div>
            </>
          )}
          {!moon.visible && <div style={{...s.rowKey, color:'var(--dim)'}}>Below horizon</div>}
        </div>
      )}

      {/* Sun */}
      {sun && (
        <div style={s.section}>
          <div style={s.sLabel}>Sun</div>
          <div style={s.row}>
            <span style={s.rowKey}>Status</span>
            <span style={s.rowVal}>
              {sun.visible ? '☀ Above horizon'
               : sun.alt > -6  ? '◐ Civil twilight'
               : sun.alt > -12 ? '◑ Nautical twi.'
               : sun.alt > -18 ? '◒ Astro. twilight'
               : '✦ Dark sky'}
            </span>
          </div>
          <div style={s.row}>
            <span style={s.rowKey}>Alt</span>
            <span style={s.rowVal}>{sun.alt.toFixed(1)}°</span>
          </div>
        </div>
      )}

      {/* Planets */}
      <div style={s.section}>
        <div style={s.sLabel}>Planets</div>
        {planets.map(p => (
          <div key={p.name} style={s.planetRow}>
            <div style={s.planetColor(p.color)} />
            <span style={{ ...s.rowKey, flex:1 }}>{p.name}</span>
            <div style={s.dot(p.visible)} />
            {p.visible && <span style={s.rowVal}>{p.alt.toFixed(0)}°</span>}
            {!p.visible && <span style={{ ...s.rowKey, color:'var(--dim)' }}>—</span>}
          </div>
        ))}
      </div>

      {/* Observer info */}
      {data && (
        <div style={s.section}>
          <div style={s.sLabel}>Observer</div>
          <div style={s.row}>
            <span style={s.rowKey}>Lat</span>
            <span style={s.rowVal}>{location?.lat?.toFixed(3)}°</span>
          </div>
          <div style={s.row}>
            <span style={s.rowKey}>Lon</span>
            <span style={s.rowVal}>{location?.lon?.toFixed(3)}°</span>
          </div>
          <div style={s.row}>
            <span style={s.rowKey}>LST</span>
            <span style={s.rowVal}>{data.lst}h</span>
          </div>
          <div style={s.row}>
            <span style={s.rowKey}>JD</span>
            <span style={{ ...s.rowVal, fontSize:'0.6rem' }}>{data.jd}</span>
          </div>
        </div>
      )}

      {/* Reset location */}
      <div style={{ padding:'1rem 1.2rem', marginTop:'auto' }}>
        <button style={s.btn}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.2)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(59,130,246,0.1)'}}
          onClick={onLocationReset}
        >◁ Change location</button>
      </div>
    </div>
  )
}
