import { useEffect, useRef } from 'react'

export default function StarField({ count = 280, style = {} }) {
  const canvasRef = useRef(null)
  const starsRef  = useRef([])
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = window.innerWidth, H = window.innerHeight

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      init()
    }

    const init = () => {
      starsRef.current = Array.from({ length: count }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.4 + 0.2,
        base:  Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        color: ['#ffffff','#cad7ff','#aabfff','#ffd2a1','#ffcc6f'][Math.floor(Math.random()*5)],
      }))
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      for (const s of starsRef.current) {
        const alpha = s.base + Math.sin(t * s.speed * 60 + s.phase) * 0.3
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
        ctx.fillStyle   = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
        // Cross sparkle for brighter stars
        if (s.r > 1.2) {
          ctx.globalAlpha = alpha * 0.3
          ctx.strokeStyle = s.color
          ctx.lineWidth   = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - s.r * 3, s.y)
          ctx.lineTo(s.x + s.r * 3, s.y)
          ctx.moveTo(s.x, s.y - s.r * 3)
          ctx.lineTo(s.x, s.y + s.r * 3)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        ...style
      }}
    />
  )
}
