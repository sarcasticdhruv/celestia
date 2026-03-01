import { useState, useMemo, useEffect, useCallback } from 'react'
import LocationModal from './components/LocationModal.jsx'
import SkyCanvas from './components/SkyCanvas.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import ConstellationPanel from './components/ConstellationPanel.jsx'
import Toolbar from './components/Toolbar.jsx'
import DetailDrawer from './components/DetailDrawer.jsx'
import { useSkyData } from './hooks/useSkyData.js'
import StarField from './components/StarField.jsx'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

export default function App() {
  const [location, setLocation]         = useState(null)
  const [jdOffset, setJdOffset]         = useState(0)
  const [magLimit, setMagLimit]         = useState(5.5)
  const [showPlanets, setShowPlanets]   = useState(true)
  const [showDSO, setShowDSO]           = useState(true)
  const [showMilkyWay, setShowMilkyWay] = useState(true)
  const [selected, setSelected]         = useState(null)
  const [activeConstellations, setActiveConstellations] = useState(new Set())
  const [fullSkyMode, setFullSkyMode]   = useState(false)
  const [showInfoPanel, setShowInfoPanel]   = useState(false)
  const [showConstPanel, setShowConstPanel] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)

  const isMobile = useIsMobile()
  const { data, loading, error } = useSkyData(location, jdOffset)

  useEffect(() => {
    if (!data?.constellations) return
    setActiveConstellations(prev => {
      if (prev.size > 0) return prev
      return new Set(Object.keys(data.constellations))
    })
  }, [data?.constellations])

  const visibleConstellations = useMemo(
    () => data?.constellations ? Object.keys(data.constellations) : [],
    [data?.constellations]
  )

  // Escape exits full sky mode
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && fullSkyMode) setFullSkyMode(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [fullSkyMode])

  // Toggle body class for full-sky cursor style
  useEffect(() => {
    document.body.classList.toggle('full-sky-mode', fullSkyMode)
    return () => document.body.classList.remove('full-sky-mode')
  }, [fullSkyMode])

  const handleLocationReset = useCallback(() => {
    setLocation(null); setActiveConstellations(new Set())
    setFullSkyMode(false)
  }, [])

  const LoadingOverlay = () => (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,1,10,0.88)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:500, backdropFilter:'blur(4px)',
      flexDirection:'column', gap:'1rem',
    }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:'2px solid rgba(59,130,246,0.15)',
        borderTop:'2px solid var(--glow)',
        animation:'rotate-slow 0.8s linear infinite',
      }}/>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--muted)', letterSpacing:'0.25em', textTransform:'uppercase' }}>
        Calculating sky…
      </div>
    </div>
  )

  const ErrorOverlay = () => (
    <div style={{
      position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)',
      background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.3)',
      borderRadius:10, padding:'0.6rem 1.2rem',
      fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'#fca5a5',
      zIndex:500, backdropFilter:'blur(12px)', whiteSpace:'nowrap',
    }}>
      ⚠ {error} — Is the backend running on port 8000?
    </div>
  )

  // ── Full Sky Mode ─────────────────────────────────────────────────────────
  if (fullSkyMode && location) {
    return (
      <div style={{ position:'fixed', inset:0, background:'#000005', overflow:'hidden' }}>
        <SkyCanvas
          data={data}
          activeConstellations={activeConstellations}
          showDSO={showDSO}
          showPlanets={showPlanets}
          showMilkyWay={showMilkyWay}
          magLimit={magLimit}
          onObjectClick={(found) => setSelected(found)}
          fullSkyMode={true}
        />
        {/* Exit button */}
        <button
          onClick={() => setFullSkyMode(false)}
          style={{
            position:'fixed', top:'1.1rem', right:'1.1rem',
            background:'#ffffff', color:'#000000',
            border:'none', borderRadius:8,
            padding:'0.5rem 1.2rem',
            fontFamily:'var(--font-mono)', fontSize:'0.65rem',
            fontWeight:700, letterSpacing:'0.15em',
            cursor:'pointer', zIndex:200,
            boxShadow:'0 2px 24px rgba(0,0,0,0.8)',
            transition:'opacity 0.15s',
            touchAction:'manipulation',
            minWidth:64, minHeight:36,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >EXIT</button>
        {loading && <LoadingOverlay />}
        {selected && <DetailDrawer selected={selected} onClose={() => setSelected(null)} />}
      </div>
    )
  }

  // ── Regular Layout ─────────────────────────────────────────────────────────
  const PANEL_L = isMobile ? 0 : 220
  const PANEL_R = isMobile ? 0 : 200

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--black)', overflow:'hidden' }}>
      <StarField count={isMobile ? 80 : 160} style={{ opacity: location ? 0 : 1, transition:'opacity 1s' }} />

      {!location && <LocationModal onLocation={setLocation} />}

      {location && (
        <div style={{ position:'fixed', inset:0, display:'flex', flexDirection:'column' }}>

          {/* Desktop Toolbar */}
          {!isMobile && (
            <Toolbar
              showPlanets={showPlanets} setShowPlanets={setShowPlanets}
              showDSO={showDSO}         setShowDSO={setShowDSO}
              showMilkyWay={showMilkyWay} setShowMilkyWay={setShowMilkyWay}
              magLimit={magLimit}       setMagLimit={setMagLimit}
              jdOffset={jdOffset}       setJdOffset={setJdOffset}
              data={data}
              onSkyMode={() => setFullSkyMode(true)}
            />
          )}

          {/* Main area */}
          <div style={{ position:'relative', flex:1, overflow:'hidden' }}>

            {/* Info panel left — desktop */}
            {!isMobile && (
              <InfoPanel
                data={data} location={location}
                onLocationReset={handleLocationReset}
              />
            )}

            {/* Sky canvas */}
            <div style={{
              position:'absolute',
              left: PANEL_L, right: PANEL_R,
              top: 0, bottom: isMobile ? 56 : 0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'radial-gradient(ellipse at 50% 60%, #040a1e 0%, #00010a 100%)',
            }}>
              {data ? (
                <SkyCanvas
                  data={data}
                  activeConstellations={activeConstellations}
                  showDSO={showDSO}
                  showPlanets={showPlanets}
                  showMilkyWay={showMilkyWay}
                  magLimit={magLimit}
                  onObjectClick={(found) => setSelected(found)}
                  fullSkyMode={false}
                />
              ) : (
                <div style={{
                  fontFamily:'var(--font-serif)', fontSize:'1.1rem',
                  color:'var(--dim)', fontStyle:'italic',
                  animation:'shimmer 2s ease-in-out infinite',
                }}>Stargazing…</div>
              )}
            </div>

            {/* Constellation panel right — desktop */}
            {!isMobile && (
              <ConstellationPanel
                activeConstellations={activeConstellations}
                setActiveConstellations={setActiveConstellations}
                visibleConstellations={visibleConstellations}
              />
            )}

            {/* Mobile Info Panel overlay */}
            {isMobile && showInfoPanel && (
              <>
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40 }}
                  onClick={() => setShowInfoPanel(false)} />
                <div style={{ position:'fixed', left:0, top:0, bottom:0, width:'min(300px,82vw)', zIndex:50, animation:'fadeIn 0.25s ease' }}>
                  <InfoPanel data={data} location={location} onLocationReset={handleLocationReset} />
                  <button onClick={() => setShowInfoPanel(false)} style={{
                    position:'absolute', top:'0.75rem', right:'-2.2rem',
                    background:'rgba(4,9,22,0.95)', border:'1px solid rgba(59,130,246,0.2)',
                    color:'var(--muted)', borderRadius:'0 6px 6px 0', padding:'0.45rem 0.55rem',
                    cursor:'pointer', fontSize:'0.75rem', lineHeight:1,
                  }}>✕</button>
                </div>
              </>
            )}

            {/* Mobile Constellation Panel overlay */}
            {isMobile && showConstPanel && (
              <>
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40 }}
                  onClick={() => setShowConstPanel(false)} />
                <div style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(260px,80vw)', zIndex:50, animation:'fadeIn 0.25s ease' }}>
                  <ConstellationPanel
                    activeConstellations={activeConstellations}
                    setActiveConstellations={setActiveConstellations}
                    visibleConstellations={visibleConstellations}
                  />
                  <button onClick={() => setShowConstPanel(false)} style={{
                    position:'absolute', top:'0.75rem', left:'-2.2rem',
                    background:'rgba(4,9,22,0.95)', border:'1px solid rgba(59,130,246,0.2)',
                    color:'var(--muted)', borderRadius:'6px 0 0 6px', padding:'0.45rem 0.55rem',
                    cursor:'pointer', fontSize:'0.75rem', lineHeight:1,
                  }}>✕</button>
                </div>
              </>
            )}

            {/* Mobile Settings overlay */}
            {isMobile && showMobileSettings && (
              <>
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40 }}
                  onClick={() => setShowMobileSettings(false)} />
                <div style={{
                  position:'fixed', left:0, right:0, bottom:56,
                  background:'rgba(2,6,20,0.97)', borderTop:'1px solid rgba(59,130,246,0.15)',
                  backdropFilter:'blur(20px)', zIndex:50,
                  padding:'1.2rem 1.4rem 1rem', animation:'fadeIn 0.2s ease',
                }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', letterSpacing:'0.3em', color:'var(--dim)', textTransform:'uppercase', marginBottom:'1rem' }}>Display Settings</div>
                  <MobileToggleRow label="Planets" icon="●" state={showPlanets} onToggle={() => setShowPlanets(v=>!v)} />
                  <MobileToggleRow label="Deep Sky Objects" icon="◎" state={showDSO} onToggle={() => setShowDSO(v=>!v)} />
                  <MobileToggleRow label="Milky Way" icon="✦" state={showMilkyWay} onToggle={() => setShowMilkyWay(v=>!v)} />
                  <div style={{ marginTop:'0.8rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--muted)' }}>Magnitude limit</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--frost)' }}>{magLimit.toFixed(1)}</span>
                    </div>
                    <input type="range" min={1} max={6.5} step={0.1} value={magLimit}
                      style={{ width:'100%', accentColor:'var(--starblue)', cursor:'pointer' }}
                      onChange={e => setMagLimit(parseFloat(e.target.value))} />
                  </div>
                  <div style={{ marginTop:'0.8rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--muted)' }}>Time offset</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--frost)' }}>
                        {jdOffset === 0 ? 'Now' : `${jdOffset > 0 ? '+' : ''}${jdOffset.toFixed(1)}h`}
                      </span>
                    </div>
                    <input type="range" min={-24} max={24} step={0.25} value={jdOffset}
                      style={{ width:'100%', accentColor:'var(--starblue)', cursor:'pointer' }}
                      onChange={e => setJdOffset(parseFloat(e.target.value))} />
                    {jdOffset !== 0 && (
                      <button onClick={() => setJdOffset(0)} style={{
                        marginTop:'0.5rem', padding:'0.3rem 0.75rem',
                        background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)',
                        borderRadius:6, cursor:'pointer', color:'var(--amber)',
                        fontFamily:'var(--font-mono)', fontSize:'0.6rem',
                      }}>Reset to Now</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile bottom bar */}
          {isMobile && (
            <div className="mobile-bottom-bar" style={{
              position:'fixed', bottom:0, left:0, right:0, height:56,
              background:'rgba(2,4,14,0.96)', backdropFilter:'blur(20px)',
              borderTop:'1px solid rgba(59,130,246,0.12)',
              display:'flex', alignItems:'center', justifyContent:'space-around',
              zIndex:30, padding:'0 0.5rem',
            }}>
              <MobileBarBtn icon="◉" label="Info" active={showInfoPanel} onClick={() => { setShowInfoPanel(v=>!v); setShowConstPanel(false); setShowMobileSettings(false) }} />
              <MobileBarBtn icon="✦" label="Stars" active={showConstPanel} onClick={() => { setShowConstPanel(v=>!v); setShowInfoPanel(false); setShowMobileSettings(false) }} />
              <MobileBarBtn icon="⚙" label="Settings" active={showMobileSettings} onClick={() => { setShowMobileSettings(v=>!v); setShowInfoPanel(false); setShowConstPanel(false) }} />
              <button
                onClick={() => setFullSkyMode(true)}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                  background:'#ffffff', color:'#000000',
                  border:'none', borderRadius:8, padding:'0.35rem 0.9rem',
                  cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'0.6rem',
                  fontWeight:700, letterSpacing:'0.1em', lineHeight:1,
                }}
              >
                <span style={{ fontSize:'0.65rem' }}>⊙</span>
                <span>SKY</span>
              </button>
              <MobileBarBtn icon="◁" label="Loc" active={false} onClick={handleLocationReset} />
            </div>
          )}
        </div>
      )}

      {loading && <LoadingOverlay />}
      {error && !loading && <ErrorOverlay />}
      {selected && <DetailDrawer selected={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function MobileBarBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap:2,
      background:'none', border:'none', cursor:'pointer',
      color: active ? 'var(--frost)' : 'var(--muted)',
      padding:'0.35rem 0.6rem', borderRadius:8,
      transition:'color 0.15s',
      fontFamily:'var(--font-mono)',
    }}>
      <span style={{ fontSize:'0.9rem', lineHeight:1 }}>{icon}</span>
      <span style={{ fontSize:'0.52rem', letterSpacing:'0.08em' }}>{label}</span>
    </button>
  )
}

function MobileToggleRow({ label, icon, state, onToggle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color: state ? 'var(--frost)' : 'var(--muted)' }}>
        {icon} {label}
      </span>
      <button onClick={onToggle} style={{
        width:38, height:22, borderRadius:11, border:'none', cursor:'pointer',
        background: state ? 'var(--starblue)' : 'rgba(255,255,255,0.1)',
        position:'relative', transition:'background 0.2s',
      }}>
        <div style={{
          position:'absolute', top:3, left: state ? 19 : 3,
          width:16, height:16, borderRadius:'50%',
          background:'white', transition:'left 0.2s',
        }}/>
      </button>
    </div>
  )
}
