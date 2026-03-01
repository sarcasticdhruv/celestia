import { useEffect, useState } from 'react'

const PLANET_FACTS = {
  Mercury: 'Closest to the Sun. A year lasts just 88 Earth days. Surface temperatures swing from −180°C to +430°C.',
  Venus:   'Hotter than Mercury despite being farther from the Sun. Thick CO₂ atmosphere causes runaway greenhouse effect.',
  Mars:    'Home to Olympus Mons, the tallest volcano in the Solar System at 21.9 km high.',
  Jupiter: 'The Great Red Spot is a storm that has raged for over 350 years. Its mass exceeds all other planets combined.',
  Saturn:  'Its iconic rings are made of ice and rock, spanning 282,000 km but only ~10 m thick in places.',
  Uranus:  'Rotates on its side — axial tilt of 97.77°. Its rings were only discovered in 1977.',
  Neptune: 'Winds reach 2,100 km/h — the fastest in the Solar System. Discovered through mathematical prediction alone.',
}

const SPECTRAL_NAMES = {
  O: 'O-type (blue, >30,000 K)', B: 'B-type (blue-white, 10–30,000 K)',
  A: 'A-type (white, 7,500–10,000 K)', F: 'F-type (yellow-white, 6,000–7,500 K)',
  G: 'G-type (yellow, like our Sun)', K: 'K-type (orange, 3,700–5,200 K)',
  M: 'M-type (red, <3,700 K)',
}

export default function DetailDrawer({ selected, onClose }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (selected) setOpen(true) }, [selected])
  const close = () => { setOpen(false); setTimeout(onClose, 300) }

  if (!selected && !open) return null

  const { type, obj } = selected || {}

  return (
    <>
      <div style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.3)',
        zIndex:200, opacity: open?1:0, transition:'opacity 0.3s',
      }} onClick={close} />
      <div style={{
        position:'fixed', right:0, top:0, bottom:0, width:'min(380px,90vw)',
        background:'rgba(3,6,18,0.97)',
        borderLeft:'1px solid rgba(59,130,246,0.2)',
        backdropFilter:'blur(24px)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        zIndex:201, overflowY:'auto', padding:'2rem 1.5rem',
        display:'flex', flexDirection:'column', gap:'1.2rem',
      }}>

        {/* Close */}
        <button style={{
          position:'absolute', top:'1rem', right:'1rem',
          background:'none', border:'none', cursor:'pointer',
          color:'var(--muted)', fontSize:'1.2rem', lineHeight:1,
        }} onClick={close}>✕</button>

        {type === 'star' && <StarDetail obj={obj} />}
        {type === 'planet' && <PlanetDetail obj={obj} />}
        {type === 'dso' && <DSODetail obj={obj} />}
        {type === 'moon' && <MoonDetail obj={obj} />}
      </div>
    </>
  )
}

function Tag({ children, color='rgba(59,130,246,0.15)', border='rgba(59,130,246,0.25)' }) {
  return <span style={{
    display:'inline-block', padding:'0.15rem 0.5rem',
    background:color, border:`1px solid ${border}`, borderRadius:20,
    fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--frost)',
    marginRight:'0.3rem', marginBottom:'0.3rem',
  }}>{children}</span>
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.4rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--muted)', letterSpacing:'0.1em' }}>{label}</span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--frost)' }}>{value}</span>
    </div>
  )
}

function StarDetail({ obj }) {
  const mag_words = obj.mag < 0 ? 'exceptionally bright' : obj.mag < 1 ? 'first magnitude' : obj.mag < 2 ? 'prominent' : obj.mag < 3 ? 'easily visible' : 'faint, but naked-eye'
  return (
    <>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', letterSpacing:'0.3em', color:'var(--dim)', textTransform:'uppercase', marginBottom:'0.3rem' }}>Star</div>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:'2.2rem', fontWeight:300, color:'var(--white)', lineHeight:1, marginBottom:'0.4rem' }}>{obj.name}</div>
        <div style={{ width:10, height:10, borderRadius:'50%', background:obj.color, display:'inline-block', marginRight:'0.4rem', verticalAlign:'middle' }}/>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--muted)' }}>{SPECTRAL_NAMES[obj.spt] || obj.spt}</span>
      </div>

      <div style={{ fontFamily:'var(--font-serif)', fontSize:'0.95rem', color:'var(--pale)', lineHeight:1.7, opacity:0.8 }}>
        {obj.name} is a {mag_words} star, currently visible at {obj.alt.toFixed(1)}° altitude.
      </div>

      <div>
        <Tag>Magnitude {obj.mag.toFixed(1)}</Tag>
        <Tag>Spectral {obj.spt}</Tag>
        <Tag color='rgba(212,168,83,0.15)' border='rgba(212,168,83,0.3)'>Alt {obj.alt.toFixed(1)}°</Tag>
        <Tag color='rgba(212,168,83,0.15)' border='rgba(212,168,83,0.3)'>Az {obj.az.toFixed(1)}°</Tag>
      </div>

      <div>
        <Row label="Altitude" value={`${obj.alt.toFixed(2)}°`} />
        <Row label="Azimuth"  value={`${obj.az.toFixed(2)}°`} />
        <Row label="Magnitude" value={obj.mag.toFixed(2)} />
        <Row label="Spectral class" value={obj.spt} />
      </div>
    </>
  )
}

function PlanetDetail({ obj }) {
  return (
    <>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', letterSpacing:'0.3em', color:'var(--dim)', textTransform:'uppercase', marginBottom:'0.3rem' }}>Planet</div>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:'2.2rem', fontWeight:300, lineHeight:1, marginBottom:'0.4rem' }}>
          <span style={{ color:obj.color }}>{obj.name}</span>
        </div>
      </div>

      <div style={{ fontFamily:'var(--font-serif)', fontSize:'0.95rem', color:'var(--pale)', lineHeight:1.7, opacity:0.8 }}>
        {PLANET_FACTS[obj.name] || ''}
      </div>

      <div>
        <Row label="Altitude"  value={`${obj.alt.toFixed(2)}°`} />
        <Row label="Azimuth"   value={`${obj.az.toFixed(2)}°`} />
        <Row label="Visible"   value={obj.visible ? 'Yes' : 'Below horizon'} />
      </div>

      {obj.name === 'Saturn' && (
        <div style={{ background:'rgba(218,165,32,0.08)', border:'1px solid rgba(218,165,32,0.2)', borderRadius:8, padding:'0.75rem', fontFamily:'var(--font-serif)', fontSize:'0.85rem', color:'#e4b96c', lineHeight:1.6 }}>
          ♇ Saturn's rings are visible with binoculars or a small telescope
        </div>
      )}
    </>
  )
}

function DSODetail({ obj }) {
  const typeColor = { Galaxy:'#c084fc', Globular:'#fbbf24', Nebula:'#60a5fa', 'Open Cluster':'#4ade80' }
  return (
    <>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', letterSpacing:'0.3em', color:'var(--dim)', textTransform:'uppercase', marginBottom:'0.3rem' }}>{obj.type}</div>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.9rem', fontWeight:300, color:'var(--white)', lineHeight:1.1, marginBottom:'0.3rem' }}>{obj.name}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color: typeColor[obj.type] || 'var(--muted)' }}>{obj.id}</div>
      </div>

      <div style={{ fontFamily:'var(--font-serif)', fontSize:'0.95rem', color:'var(--pale)', lineHeight:1.7, opacity:0.8 }}>
        {obj.desc}
      </div>

      <div>
        <Tag color={`${typeColor[obj.type] || 'rgba(59,130,246'}15)`.replace('rgba(59,130,246','rgba(59,130,246,0.')} border='rgba(59,130,246,0.25)'>{obj.type}</Tag>
        <Tag>Magnitude {obj.mag}</Tag>
      </div>

      <div>
        <Row label="Altitude"  value={`${obj.alt.toFixed(1)}°`} />
        <Row label="Azimuth"   value={`${obj.az.toFixed(1)}°`} />
        <Row label="Magnitude" value={obj.mag} />
      </div>
    </>
  )
}

function MoonDetail({ obj }) {
  const moonEmojis = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘']
  const ei = Math.round(obj.phase * 8) % 8
  return (
    <>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', letterSpacing:'0.3em', color:'var(--dim)', textTransform:'uppercase', marginBottom:'0.3rem' }}>The Moon</div>
        <div style={{ fontSize:'4rem', lineHeight:1, marginBottom:'0.4rem' }}>{moonEmojis[ei]}</div>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.8rem', fontWeight:300, color:'var(--white)', lineHeight:1 }}>{obj.phase_name}</div>
      </div>

      <div style={{ fontFamily:'var(--font-serif)', fontSize:'0.95rem', color:'var(--pale)', lineHeight:1.7, opacity:0.8 }}>
        The Moon is {obj.illumination}% illuminated. The average distance to the Moon is 384,400 km.
        Moonrise and moonset times vary each night as the Moon orbits Earth once every 27.3 days.
      </div>

      <div>
        <Row label="Phase"         value={obj.phase_name} />
        <Row label="Illumination"  value={`${obj.illumination}%`} />
        <Row label="Altitude"      value={`${obj.alt.toFixed(1)}°`} />
        <Row label="Azimuth"       value={`${obj.az.toFixed(1)}°`} />
      </div>
    </>
  )
}
