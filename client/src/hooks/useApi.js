import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

/**
 * Generic API fetching hook.
 * Re-fetches when `url` or `deps` change.
 */
export function useApi(url, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const fetch = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const res = await axios.get(url, { signal: abortRef.current.signal })
      setData(res.data)
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch data')
      }
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps])

  useEffect(() => {
    fetch()
    return () => abortRef.current?.abort()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
