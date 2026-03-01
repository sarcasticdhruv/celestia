import { useState } from 'react'

const s = {
  bar: {
    position: 'absolute', top: 0, left: 220, right: 200,
    height: 52, background: 'rgba(2,4,14,0.75)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(59,130,246,0.1)',
    display: 'flex', alignItems: 'center',
    padding: '0 1.5rem', gap: '0.75rem', zIndex: 10,
  },
  toggle: (on) => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.35rem 0.8rem',
    background: on ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${on ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 20, cursor: 'pointer',
    color: on ? 'var(--frost)' : 'var(--muted)',
    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
    letterSpacing: '0.1em', transition: 'all 0.2s',
    userSelect: 'none',
  }),
  dot: (on) => ({
    width: 6, height: 6, borderRadius: '50%',
    background: on ? 'var(--glow)' : 'var(--dim)',
    transition: 'background 0.2s',
  }),
  slider: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginLeft: 'auto', flexShrink: 0,
  },
  sliderLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
    color: 'var(--muted)', letterSpacing: '0.1em',
    whiteSpace: 'nowrap',
  },
  time: {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    color: 'var(--muted)', marginLeft: 'auto', letterSpacing: '0.1em',
    flexShrink: 0, whiteSpace: 'nowrap',
  },
  range: {
    width: 110, height: 3, accentColor: 'var(--starblue)',
    cursor: 'pointer',
  },
  divider: {
    width: 1, height: 22, background: 'rgba(255,255,255,0.06)', flexShrink: 0,
  },
}

export default function Toolbar({
  showPlanets, setShowPlanets,
  showDSO, setShowDSO,
  showMilkyWay, setShowMilkyWay,
  magLimit, setMagLimit,
  jdOffset, setJdOffset,
  data,
  onSkyMode,
}) {
  const T = ({ label, icon, state, onToggle }) => (
    <button style={s.toggle(state)}
      onMouseEnter={e => { e.currentTarget.style.background = state ? 'rgba(59,130,246,0.28)' : 'rgba(255,255,255,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.background = state ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)' }}
      onClick={onToggle}
    >
      <div style={s.dot(state)} />
      <span>{icon} {label}</span>
    </button>
  )

  const fmtOffset = (h) => {
    if (h === 0) return 'Now'
    const abs = Math.abs(h)
    if (abs < 1) return `${h > 0 ? '+' : '-'}${Math.round(abs * 60)}m`
    return `${h > 0 ? '+' : ''}${h.toFixed(1)}h`
  }

  return (
    <div style={s.bar}>
      <T label="Planets"   icon="●" state={showPlanets}  onToggle={() => setShowPlanets(v => !v)} />
      <T label="Deep Sky"  icon="◎" state={showDSO}      onToggle={() => setShowDSO(v => !v)} />
      <T label="Milky Way" icon="✦" state={showMilkyWay} onToggle={() => setShowMilkyWay(v => !v)} />

      <div style={s.divider} />

      {/* Magnitude limit */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <span style={s.sliderLabel}>MAG</span>
        <input type="range" min={1} max={6.5} step={0.1} value={magLimit}
          style={s.range}
          onChange={e => setMagLimit(parseFloat(e.target.value))} />
        <span style={{ ...s.sliderLabel, color:'var(--frost)', minWidth:24 }}>{magLimit.toFixed(1)}</span>
      </div>

      <div style={s.divider} />

      {/* Time offset */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <span style={s.sliderLabel}>TIME</span>
        <input type="range" min={-24} max={24} step={0.25} value={jdOffset}
          style={{ ...s.range, width: 120 }}
          onChange={e => setJdOffset(parseFloat(e.target.value))} />
        <span style={{ ...s.sliderLabel, color:'var(--frost)', minWidth:36 }}>{fmtOffset(jdOffset)}</span>
        {jdOffset !== 0 && (
          <button style={{
            padding:'0.15rem 0.4rem', background:'rgba(251,191,36,0.1)',
            border:'1px solid rgba(251,191,36,0.3)', borderRadius:4,
            cursor:'pointer', color:'var(--amber)', fontFamily:'var(--font-mono)',
            fontSize:'0.55rem', letterSpacing:'0.1em',
          }} onClick={() => setJdOffset(0)}>NOW</button>
        )}
      </div>

      {data && (
        <div style={{ ...s.time, marginLeft:'auto' }}>
          {data.time}
        </div>
      )}

      {/* SKY mode button */}
      <button
        onClick={onSkyMode}
        style={{
          marginLeft: data ? '0.75rem' : 'auto',
          padding: '0.38rem 1rem',
          background: '#ffffff',
          color: '#000000',
          border: 'none',
          borderRadius: 7,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.63rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          transition: 'opacity 0.15s',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
        title="Full sky view"
        onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >SKY</button>
    </div>
  )
}
