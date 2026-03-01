import { useState, useEffect, useCallback } from 'react'

export function useSkyData(location, jdOffset = 0) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const fetch_data = useCallback(async () => {
    if (!location) return
    setLoading(true)
    setError(null)
    try {
      const base_jd  = Date.now() / 86400000 + 2440587.5
      const jd       = base_jd + jdOffset / 24
      const url      = `/api/sky?lat=${location.lat}&lon=${location.lon}&jd=${jd}`
      const resp     = await fetch(url)
      if (!resp.ok) throw new Error(`API ${resp.status}`)
      const json     = await resp.json()
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [location, jdOffset])

  useEffect(() => { fetch_data() }, [fetch_data])

  // Auto-refresh every 60s when jdOffset=0
  useEffect(() => {
    if (jdOffset !== 0) return
    const id = setInterval(fetch_data, 60000)
    return () => clearInterval(id)
  }, [fetch_data, jdOffset])

  return { data, loading, error, refetch: fetch_data }
}
