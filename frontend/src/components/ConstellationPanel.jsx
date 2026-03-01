import { useMemo } from 'react'

const ALL_CONSTELLATIONS = [
  'Orion','Ursa Major','Cassiopeia','Perseus','Auriga','Gemini',
  'Canis Major','Taurus','Leo','Virgo','Boötes','Scorpius',
  'Sagittarius','Cygnus','Lyra','Aquila','Hercules','Ophiuchus',
  'Corona Borealis','Draco','Andromeda','Pegasus','Centaurus','Crux','Libra',
]

const CONSTELLATION_ICONS = {
  'Orion': '🏹', 'Ursa Major': '🐻', 'Cassiopeia': 'W',
  'Perseus': '⚔', 'Auriga': '🐐', 'Gemini': '♊',
  'Canis Major': '🐕', 'Taurus': '♉', 'Leo': '♌',
  'Virgo': '♍', 'Boötes': '🌾', 'Scorpius': '♏',
  'Sagittarius': '♐', 'Cygnus': '🦢', 'Lyra': '🎵',
  'Aquila': '🦅', 'Hercules': '💪', 'Ophiuchus': '🐍',
  'Corona Borealis': '♛', 'Draco': '🐉', 'Andromeda': '⛓',
  'Pegasus': '🐴', 'Centaurus': '🏇', 'Crux': '✚', 'Libra': '♎',
}

export default function ConstellationPanel({ activeConstellations, setActiveConstellations, visibleConstellations }) {
  const visibleSet = useMemo(() => new Set(visibleConstellations || []), [visibleConstellations])

  const toggle = (name) => {
    setActiveConstellations(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const selectAll = () => setActiveConstellations(new Set(visibleConstellations || ALL_CONSTELLATIONS))
  const clearAll  = () => setActiveConstellations(new Set())

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0,
      width: 200, background: 'rgba(2,4,14,0.82)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid rgba(59,130,246,0.1)',
      display: 'flex', flexDirection: 'column',
      padding: '1.5rem 0', overflowY: 'auto', zIndex: 10,
      animation: 'fadeIn 0.6s ease',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
        letterSpacing: '0.3em', color: 'var(--dim)',
        textTransform: 'uppercase', padding: '0 1rem', marginBottom: '0.6rem',
      }}>Constellations</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: '0.8rem',
        color: 'var(--muted)', padding: '0 1rem', marginBottom: '1rem',
        fontStyle: 'italic',
      }}>
        {activeConstellations.size} of {visibleSet.size} shown
      </div>

      {/* All / None */}
      <div style={{ display:'flex', gap:'0.4rem', padding:'0 1rem', marginBottom:'1rem' }}>
        {[['All', selectAll], ['None', clearAll]].map(([lbl, fn]) => (
          <button key={lbl} onClick={fn} style={{
            flex: 1, padding: '0.3rem', background:'rgba(59,130,246,0.08)',
            border:'1px solid rgba(59,130,246,0.2)', borderRadius:6,
            cursor:'pointer', color:'var(--frost)', fontFamily:'var(--font-mono)',
            fontSize:'0.6rem', letterSpacing:'0.15em', transition:'all 0.15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(59,130,246,0.08)'}
          >{lbl}</button>
        ))}
      </div>

      {/* Constellation list */}
      <div style={{ flex: 1, overflowY:'auto', padding: '0 0.6rem' }}>
        {ALL_CONSTELLATIONS.map(name => {
          const isVisible = visibleSet.has(name)
          const isActive  = activeConstellations.has(name)
          return (
            <button key={name}
              onClick={() => isVisible && toggle(name)}
              disabled={!isVisible}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                width: '100%', padding: '0.5rem 0.6rem',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(59,130,246,0.25)' : 'transparent',
                borderRadius: 8, cursor: isVisible ? 'pointer' : 'default',
                marginBottom: '0.25rem', transition: 'all 0.15s',
                opacity: isVisible ? 1 : 0.3,
              }}
              onMouseEnter={e => { if (isVisible) e.currentTarget.style.background = isActive ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => e.currentTarget.style.background = isActive ? 'rgba(59,130,246,0.12)' : 'transparent'}
            >
              <span style={{ fontSize:'0.85rem', flexShrink:0, width:18, textAlign:'center' }}>
                {CONSTELLATION_ICONS[name] || '✦'}
              </span>
              <div style={{ textAlign:'left', minWidth:0 }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '0.85rem',
                  color: isActive ? 'var(--frost)' : 'var(--muted)',
                  lineHeight: 1.2, transition: 'color 0.15s',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>{name}</div>
                {!isVisible && (
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--dim)', letterSpacing:'0.1em' }}>below horizon</div>
                )}
              </div>
              {isActive && (
                <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'var(--glow)', flexShrink:0 }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
