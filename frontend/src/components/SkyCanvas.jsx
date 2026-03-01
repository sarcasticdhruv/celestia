import { useEffect, useRef, useCallback, useState } from 'react'

const MAG_LIMIT_DEFAULT = 5.5
const HOVER_RADIUS = 18

export default function SkyCanvas({
  data, activeConstellations, showDSO, showPlanets,
  showMilkyWay, magLimit = MAG_LIMIT_DEFAULT,
  onObjectHover, onObjectClick,
  fullSkyMode = false,
}) {
  const canvasRef   = useRef(null)
  const rafRef      = useRef(null)
  const hoverRef    = useRef(null)
  const dataRef     = useRef(data)
  const activeRef   = useRef(activeConstellations)
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => { dataRef.current  = data              }, [data])
  useEffect(() => { activeRef.current = activeConstellations }, [activeConstellations])

  // Convert (x,y) in [-1,1] normalized space to canvas pixels
  const toCanvas = useCallback((nx, ny, cx, cy, R) => {
    return [cx + nx * R, cy - ny * R]
  }, [])

  // ── Draw ─────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const d   = dataRef.current
    if (!d) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    // Full sky mode uses a larger projection radius that overflows the screen edges
    // so stars fill all 4 corners — creating an immersive flat-dome effect
    const R = fullSkyMode
      ? Math.max(W, H) * 0.62
      : Math.min(W, H) * 0.44

    ctx.clearRect(0, 0, W, H)

    if (fullSkyMode) {
      // ── Full-sky background ──────────────────────────────────
      // Deep space: near-black with a hint of midnight blue at zenith
      const skyGrad = ctx.createRadialGradient(cx, cy * 0.55, 0, cx, cy * 0.8, R * 0.85)
      skyGrad.addColorStop(0,   '#0d1e3a')   // deep midnight blue at zenith
      skyGrad.addColorStop(0.35,'#060e1e')
      skyGrad.addColorStop(0.7, '#020710')
      skyGrad.addColorStop(1,   '#000105')   // near-black at horizon
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, H)

      // Atmospheric horizon glow (Rayleigh scattering near horizon)
      const atmGrad = ctx.createLinearGradient(0, cy * 0.7, 0, H)
      atmGrad.addColorStop(0,   'rgba(0,0,0,0)')
      atmGrad.addColorStop(0.55,'rgba(8,20,55,0.12)')
      atmGrad.addColorStop(1,   'rgba(14,35,80,0.22)')
      ctx.fillStyle = atmGrad
      ctx.fillRect(0, 0, W, H)

      // No clip — stars render beyond edge (natural cutoff by screen)
      ctx.save()
    } else {
      // ── Dome background ──────────────────────────────────────
      const grad = ctx.createRadialGradient(cx, cy - R*0.1, 0, cx, cy, R)
      grad.addColorStop(0,   'rgba(10,22,50,0.95)')
      grad.addColorStop(0.6, 'rgba(4,9,22,0.98)')
      grad.addColorStop(1,   'rgba(0,1,10,1)')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Subtle horizon glow
      const horizGrad = ctx.createRadialGradient(cx, cy + R*0.6, R*0.3, cx, cy + R*0.6, R*1.1)
      horizGrad.addColorStop(0, 'rgba(16,42,80,0.35)')
      horizGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fillStyle = horizGrad; ctx.fill()

      // Clip everything to dome circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
    }

    // ── Milky Way ────────────────────────────────────────────────
    if (showMilkyWay && d.milky_way) {
      // In full sky mode use stronger, more natural opacity
      const alphaScale = fullSkyMode ? 2.2 : 1.0
      const sizeScale  = fullSkyMode ? 1.4 : 1.0
      const bandAlphas = [0.18, 0.07, 0.07, 0.035, 0.035].map(a => a * alphaScale)
      const bandSizes  = [180, 100, 100, 70, 70].map(s => s * sizeScale)
      d.milky_way.forEach((band, bi) => {
        for (const pt of band.points) {
          if (!pt) continue
          const [px, py] = toCanvas(pt.x, pt.y, cx, cy, R)
          // Skip points that are way off screen in full sky mode
          if (fullSkyMode && (px < -bandSizes[bi] || px > W + bandSizes[bi] || py < -bandSizes[bi] || py > H + bandSizes[bi])) continue
          const ga = ctx.createRadialGradient(px, py, 0, px, py, bandSizes[bi] / 2)
          // Full sky: use a warmer, slightly more visible milky way color
          const col = fullSkyMode ? '55,80,155' : '40,70,140'
          ga.addColorStop(0,   `rgba(${col},${bandAlphas[bi]})`)
          ga.addColorStop(1,   'rgba(0,0,0,0)')
          ctx.fillStyle = ga
          ctx.beginPath()
          ctx.arc(px, py, bandSizes[bi] / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })
    }

    // ── Altitude rings & cardinal labels (dome mode only) ────────
    if (!fullSkyMode) {
      for (const alt of [0, 30, 60]) {
        const r = ((90 - alt) / 90) * R
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = alt === 0 ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.07)'
        ctx.lineWidth   = alt === 0 ? 1.2 : 0.6
        ctx.setLineDash(alt === 0 ? [] : [4, 8])
        ctx.stroke()
        ctx.setLineDash([])
        if (alt > 0) {
          ctx.fillStyle    = 'rgba(100,148,237,0.35)'
          ctx.font         = '10px var(--font-mono)'
          ctx.textAlign    = 'left'
          ctx.fillText(`${alt}°`, cx + 6, cy - r + 14)
        }
      }

      // Cardinal lines
      const cardinals = [
        [0,'N'],[90,'E'],[180,'S'],[270,'W'],
        [45,'NE'],[135,'SE'],[225,'SW'],[315,'NW'],
      ]
      for (const [az, label] of cardinals) {
        const th = (az * Math.PI) / 180
        const ex = cx + Math.sin(th) * R
        const ey = cy - Math.cos(th) * R
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = 'rgba(59,130,246,0.06)'
        ctx.lineWidth   = 0.5
        ctx.stroke()
        const lx = cx + Math.sin(th) * (R + 18)
        const ly = cy - Math.cos(th) * (R + 18)
        const isMain = label.length === 1
        ctx.fillStyle = isMain ? 'rgba(147,197,253,0.65)' : 'rgba(100,148,237,0.3)'
        ctx.font      = isMain ? `bold 13px var(--font-mono)` : `10px var(--font-mono)`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(label, lx, ly)
      }
    }

    // ── Constellation lines ──────────────────────────────────────
    if (d.constellations && activeRef.current.size > 0) {
      for (const [name, segs] of Object.entries(d.constellations)) {
        if (!activeRef.current.has(name)) continue
        ctx.strokeStyle = 'rgba(96,165,250,0.28)'
        ctx.lineWidth   = 0.85
        ctx.setLineDash([])
        for (const seg of segs) {
          const [x1, y1] = toCanvas(seg.x1, seg.y1, cx, cy, R)
          const [x2, y2] = toCanvas(seg.x2, seg.y2, cx, cy, R)
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        }
      }
    }

    // ── Stars ────────────────────────────────────────────────────
    const t = performance.now() / 1000
    // In full sky mode let all stars through regardless of magLimit (they already exist in catalog)
    const effectiveMagLimit = fullSkyMode ? Math.max(magLimit, 6.0) : magLimit
    for (const star of (d.stars || [])) {
      if (star.mag > effectiveMagLimit) continue
      const [px, py] = toCanvas(star.x, star.y, cx, cy, R)
      // Skip off-screen stars in full sky mode
      if (fullSkyMode && (px < -20 || px > W + 20 || py < -20 || py > H + 20)) continue

      // Slightly larger stars in full sky mode for more visual impact
      const scaleFactor = fullSkyMode ? 1.15 : 1.0
      const baseSize = Math.max(0.6, 3.5 * Math.pow(10, -0.3 * star.mag)) * scaleFactor

      // Twinkle — more pronounced in full sky mode
      const twinkleAmp = fullSkyMode ? 0.35 : 0.25
      const twinkle = star.mag < 2.5 ? Math.sin(t * (1.2 + star.mag * 0.3) + px * 0.05) * twinkleAmp : 0
      const size    = baseSize * (1 + twinkle)

      // Extended glow for bright stars (more visible in full sky)
      const glowThreshold = fullSkyMode ? 3.5 : 2.5
      if (star.mag < glowThreshold) {
        const glowMult = fullSkyMode ? (star.mag < 1 ? 9 : star.mag < 2 ? 7 : 5) : (star.mag < 1 ? 7 : 5)
        const glowR = size * glowMult
        const glow  = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        const alpha1 = fullSkyMode ? '55' : '40'
        glow.addColorStop(0, star.color + alpha1)
        glow.addColorStop(1, star.color + '00')
        ctx.fillStyle = glow
        ctx.beginPath(); ctx.arc(px, py, glowR, 0, Math.PI * 2); ctx.fill()
      }

      // Star disc
      ctx.globalAlpha = fullSkyMode ? 0.97 : 0.92
      ctx.fillStyle   = star.color
      ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill()

      // Cross diffraction for very bright stars
      if (star.mag < 0.5) {
        ctx.globalAlpha = fullSkyMode ? 0.35 : 0.25
        ctx.strokeStyle = star.color
        ctx.lineWidth   = 0.5
        const spikes = fullSkyMode ? [0, Math.PI/4, Math.PI/8, -Math.PI/8] : [0, Math.PI/4]
        for (const angle of spikes) {
          ctx.beginPath()
          ctx.moveTo(px + Math.cos(angle) * size * 6, py + Math.sin(angle) * size * 6)
          ctx.lineTo(px - Math.cos(angle) * size * 6, py - Math.sin(angle) * size * 6)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1

      // Hover highlight
      if (hoverRef.current === star.name) {
        ctx.beginPath(); ctx.arc(px, py, size + 4, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(147,197,253,0.6)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle   = 'rgba(147,197,253,0.8)'
        ctx.font        = '11px var(--font-serif)'
        ctx.textAlign   = 'left'; ctx.textBaseline = 'bottom'
        ctx.fillText(star.name, px + 8, py - 4)
      }

      // Labels for bright stars
      const labelMag = fullSkyMode ? 1.8 : 1.5
      if (star.mag < labelMag && !fullSkyMode) {
        ctx.fillStyle    = 'rgba(147,197,253,0.5)'
        ctx.font         = '10px var(--font-serif)'
        ctx.textAlign    = 'left'; ctx.textBaseline = 'bottom'
        ctx.fillText(star.name, px + size + 4, py - 2)
      } else if (star.mag < 1.2 && fullSkyMode) {
        // Show only very bright star names in full sky mode
        ctx.fillStyle    = 'rgba(147,197,253,0.45)'
        ctx.font         = '11px var(--font-serif)'
        ctx.textAlign    = 'left'; ctx.textBaseline = 'bottom'
        ctx.fillText(star.name, px + size + 5, py - 3)
      }
    }

    // ── Deep Sky Objects ─────────────────────────────────────────
    if (showDSO && d.dso) {
      for (const obj of d.dso) {
        const [px, py] = toCanvas(obj.x, obj.y, cx, cy, R)
        if (obj.type === 'Galaxy') {
          ctx.save()
          ctx.translate(px, py); ctx.scale(1, 0.5); ctx.rotate(0.5)
          const r = 12
          ctx.strokeStyle = 'rgba(192,132,252,0.6)'; ctx.lineWidth = 0.8
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke()
          ctx.restore()
        } else if (obj.type === 'Globular') {
          ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 0.9
          ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(px-6,py); ctx.lineTo(px+6,py)
          ctx.moveTo(px,py-6); ctx.lineTo(px,py+6); ctx.stroke()
        } else if (obj.type === 'Nebula') {
          ctx.strokeStyle = 'rgba(96,165,250,0.5)'; ctx.lineWidth = 0.8
          const s = 9
          ctx.strokeRect(px-s, py-s, s*2, s*2)
          ctx.strokeStyle = 'rgba(96,165,250,0.2)'; ctx.lineWidth = 4
          ctx.strokeRect(px-s, py-s, s*2, s*2)
        } else {
          ctx.strokeStyle = 'rgba(134,239,172,0.55)'; ctx.lineWidth = 0.8
          ctx.setLineDash([2,3])
          ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI*2); ctx.stroke()
          ctx.setLineDash([])
        }
        ctx.fillStyle    = 'rgba(147,197,253,0.45)'
        ctx.font         = '9px var(--font-mono)'
        ctx.textAlign    = 'left'; ctx.textBaseline = 'top'
        ctx.fillText(obj.id, px+12, py+2)
      }
    }

    // ── Planets ──────────────────────────────────────────────────
    if (showPlanets && d.planets) {
      for (const p of d.planets) {
        if (!p.visible || p.x == null) continue
        const [px, py] = toCanvas(p.x, p.y, cx, cy, R)
        // Glow
        const glowR  = 16
        const pGlow  = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        pGlow.addColorStop(0, p.color + '60')
        pGlow.addColorStop(1, p.color + '00')
        ctx.fillStyle = pGlow
        ctx.beginPath(); ctx.arc(px, py, glowR, 0, Math.PI*2); ctx.fill()
        // Disc
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2); ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.5
        ctx.stroke()
        // Saturn rings
        if (p.name === 'Saturn') {
          ctx.save()
          ctx.translate(px, py); ctx.scale(1, 0.35)
          ctx.beginPath()
          ctx.ellipse(0, 0, 11, 11, 0, 0, Math.PI*2)
          ctx.strokeStyle = p.color + 'cc'; ctx.lineWidth = 3
          ctx.stroke()
          ctx.restore()
        }
        // Label
        ctx.fillStyle    = p.color
        ctx.font         = 'bold 11px var(--font-serif)'
        ctx.textAlign    = 'left'; ctx.textBaseline = 'middle'
        ctx.fillText(p.name, px + 10, py)
      }
    }

    // ── Moon ─────────────────────────────────────────────────────
    if (d.moon && d.moon.visible) {
      const [mx, my] = toCanvas(d.moon.x, d.moon.y, cx, cy, R)
      const mR       = 14
      const phase    = d.moon.phase

      // Glow
      const mGlow = ctx.createRadialGradient(mx, my, 0, mx, my, mR*4)
      mGlow.addColorStop(0, 'rgba(240,240,200,0.12)')
      mGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = mGlow; ctx.beginPath(); ctx.arc(mx, my, mR*4, 0, Math.PI*2); ctx.fill()

      // Moon disc
      ctx.save()
      ctx.beginPath(); ctx.arc(mx, my, mR, 0, Math.PI*2)
      ctx.fillStyle = '#f5f0c8'; ctx.fill()

      // Phase shadow
      ctx.beginPath(); ctx.arc(mx, my, mR, -Math.PI/2, Math.PI/2)
      ctx.lineTo(mx, my - mR)
      ctx.fillStyle = 'rgba(0,1,10,0.85)'
      const waxing = phase < 0.5
      if (waxing) {
        // Dark on right during waxing
        const bulge = mR * (1 - 2 * phase)
        ctx.bezierCurveTo(mx - bulge, my - mR, mx - bulge, my + mR, mx, my + mR)
      } else {
        const bulge = mR * (2 * phase - 1)
        ctx.bezierCurveTo(mx + bulge, my - mR, mx + bulge, my + mR, mx, my + mR)
      }
      ctx.fill()
      ctx.restore()

      ctx.strokeStyle = 'rgba(255,255,220,0.3)'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.arc(mx, my, mR, 0, Math.PI*2); ctx.stroke()
      ctx.fillStyle    = 'rgba(240,240,180,0.7)'
      ctx.font         = '10px var(--font-serif)'
      ctx.textAlign    = 'center'; ctx.textBaseline = 'top'
      ctx.fillText('Moon', mx, my + mR + 4)
    }

    // ── Sun ──────────────────────────────────────────────────────
    if (d.sun && d.sun.visible) {
      const [sx, sy] = toCanvas(d.sun.x, d.sun.y, cx, cy, R)
      // Daylight tint
      const dayAlpha = Math.min(0.25, (d.sun.alt + 5) / 40)
      const dayGrad  = ctx.createRadialGradient(cx, cy*1.2, 0, cx, cy, R)
      dayGrad.addColorStop(0, `rgba(30,60,120,${dayAlpha*1.5})`)
      dayGrad.addColorStop(1, `rgba(5,15,40,${dayAlpha})`)
      ctx.fillStyle = dayGrad; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill()

      const sGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 50)
      sGlow.addColorStop(0, 'rgba(255,220,80,0.8)')
      sGlow.addColorStop(0.4,'rgba(255,180,40,0.3)')
      sGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = sGlow; ctx.beginPath(); ctx.arc(sx,sy,50,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#ffe04a'; ctx.beginPath(); ctx.arc(sx,sy,10,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='rgba(255,220,80,0.9)'; ctx.font='bold 12px var(--font-serif)'
      ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText('Sun',sx+14,sy)
    } else if (d.sun && d.sun.alt > -18) {
      // Twilight gradient
      const tw = Math.max(0, Math.min(0.4, (d.sun.alt + 18) / 18))
      const twGrad = ctx.createLinearGradient(cx, cy, cx, cy + R)
      twGrad.addColorStop(0, `rgba(10,30,70,0)`)
      twGrad.addColorStop(1, `rgba(180,80,20,${tw * 0.35})`)
      ctx.fillStyle = twGrad; ctx.fillRect(cx-R, cy, R*2, R)
    }

    ctx.restore() // dome clip or full-sky save

    if (!fullSkyMode) {
      // ── Dome border ──────────────────────────────────────────────
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2)
      const borderGrad = ctx.createLinearGradient(cx-R, cy-R, cx+R, cy+R)
      borderGrad.addColorStop(0, 'rgba(59,130,246,0.3)')
      borderGrad.addColorStop(0.5,'rgba(59,130,246,0.15)')
      borderGrad.addColorStop(1, 'rgba(59,130,246,0.3)')
      ctx.strokeStyle = borderGrad; ctx.lineWidth = 1.5; ctx.stroke()

      // Zenith dot
      ctx.fillStyle    = 'rgba(147,197,253,0.3)'
      ctx.font         = '10px var(--font-mono)'
      ctx.textAlign    = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText('ZENITH', cx, cy - 4)
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(147,197,253,0.4)'; ctx.fill()
    }

  }, [toCanvas, magLimit, showDSO, showPlanets, showMilkyWay, fullSkyMode])

  // Animate
  useEffect(() => {
    let running = true
    const loop = () => { if (running) { draw(); rafRef.current = requestAnimationFrame(loop) } }
    loop()
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [draw])

  // Resize
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current
      if (!c) return
      c.width  = c.offsetWidth
      c.height = c.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [])

  // Mouse hover / click
  const getHovered = useCallback((mx, my) => {
    const c  = canvasRef.current
    if (!c || !dataRef.current) return null
    const W  = c.width, H = c.height
    const R  = fullSkyMode ? Math.max(W,H) * 0.62 : Math.min(W,H) * 0.44
    const cx = W/2, cy = H/2
    const d  = dataRef.current
    let best = null, bestD = HOVER_RADIUS

    // Check stars
    for (const s of (d.stars || [])) {
      if (s.mag > (magLimit||5.5)) continue
      const [px,py] = [cx + s.x*R, cy - s.y*R]
      const dist = Math.hypot(mx-px, my-py)
      if (dist < bestD) { bestD=dist; best={type:'star', obj:s, px, py} }
    }
    // Check planets
    if (showPlanets) {
      for (const p of (d.planets||[])) {
        if (!p.visible||p.x==null) continue
        const [px,py]=[cx+p.x*R, cy-p.y*R]
        const dist=Math.hypot(mx-px, my-py)
        if (dist<bestD+4) { bestD=dist; best={type:'planet',obj:p,px,py} }
      }
    }
    // Check DSO
    if (showDSO) {
      for (const dso of (d.dso||[])) {
        const [px,py]=[cx+dso.x*R, cy-dso.y*R]
        const dist=Math.hypot(mx-px, my-py)
        if (dist<bestD+6) { bestD=dist; best={type:'dso',obj:dso,px,py} }
      }
    }
    // Check moon
    if (d.moon?.visible) {
      const [px,py]=[cx+d.moon.x*R, cy-d.moon.y*R]
      if (Math.hypot(mx-px,my-py)<20) best={type:'moon',obj:d.moon,px,py}
    }
    return best
  }, [magLimit, showPlanets, showDSO, fullSkyMode])

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const found = getHovered(mx, my)
    hoverRef.current = found?.type === 'star' ? found.obj.name : null
    setHovered(found)
    if (found) {
      setTooltip({ x: e.clientX, y: e.clientY, obj: found })
    } else {
      setTooltip(null)
    }
    if (onObjectHover) onObjectHover(found?.obj || null)
  }, [getHovered, onObjectHover])

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const found = getHovered(mx, my)
    if (found && onObjectClick) onObjectClick(found)
  }, [getHovered, onObjectClick])

  const handleTouchEnd = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const touch = e.changedTouches[0]
    if (!touch) return
    const mx = touch.clientX - rect.left, my = touch.clientY - rect.top
    const found = getHovered(mx, my)
    if (found && onObjectClick) onObjectClick(found)
  }, [getHovered, onObjectClick])

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background: fullSkyMode ? '#000105' : 'transparent' }}>
      <canvas
        ref={canvasRef}
        style={{ display:'block', width:'100%', height:'100%', cursor: hovered ? 'pointer' : 'crosshair', touchAction:'none' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHovered(null); setTooltip(null); hoverRef.current=null }}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
      />
      {tooltip && <Tooltip tooltip={tooltip} />}
    </div>
  )
}

function Tooltip({ tooltip }) {
  const { x, y, obj } = tooltip
  const o = obj.obj
  const labels = {
    star:   () => (<><b>{o.name}</b><br/>Mag {o.mag.toFixed(1)}  Spectral {o.spt}<br/>Alt {o.alt}°  Az {o.az}°</>),
    planet: () => (<><b>{o.name}</b><br/>Alt {o.alt.toFixed(1)}°  Az {o.az.toFixed(1)}°</>),
    dso:    () => (<><b>{o.name}</b><br/>{o.type}  {o.id}  m{o.mag}<br/><i style={{fontSize:'0.8em',opacity:0.8}}>{o.desc}</i><br/>Alt {o.alt.toFixed(0)}°</>),
    moon:   () => (<><b>Moon</b><br/>{o.phase_name}<br/>{o.illumination}% illuminated<br/>Alt {o.alt.toFixed(1)}°</>),
  }
  const content = (labels[obj.type] || labels.star)()
  return (
    <div style={{
      position: 'fixed', left: x + 12, top: y - 8,
      background: 'rgba(4,9,22,0.92)', border: '1px solid rgba(59,130,246,0.3)',
      borderRadius: 10, padding: '0.7rem 1rem',
      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.7,
      color: 'var(--frost)', pointerEvents: 'none', zIndex: 999,
      backdropFilter: 'blur(12px)', maxWidth: 220,
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    }}>
      {content}
    </div>
  )
}
