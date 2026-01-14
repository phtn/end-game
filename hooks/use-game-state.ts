import { extractGameStateFromHtml, type GameState } from '@/lib/radon/extractor'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useApiCall } from './use-api-call'

const SPORT_URL = process.env.RADON_URL || 'https://statshub.sportradar.com/betika/en/sport'

interface HtmlProxyResponse {
  type: 'html'
  content: string
}

interface UseGameStateReturn {
  gameStates: GameState[]
  isLoading: boolean
  isError: boolean
  error: string | null
  timestamp: number | null
  isPolling: boolean
  startPolling: (url?: string) => void
  stopPolling: () => void
}

/**
 * Hook to poll and extract game state from sr-lmts-state elements
 * Polls every 3 seconds by default
 */
export function useGameState(pollInterval: number = 6000): UseGameStateReturn {
  const api = useApiCall<HtmlProxyResponse>()
  const { execute } = api
  const [gameStates, setGameStates] = useState<GameState[]>([])
  const [timestamp, setTimestamp] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const urlRef = useRef<string | null>(null)
  const isPollingRef = useRef(false)

  const fetchGameState = useCallback(
    async (targetUrl?: string): Promise<GameState[]> => {
      const url = targetUrl || urlRef.current || `${SPORT_URL}/2/tournament/1956?status=live`

      // Store URL for subsequent polls
      if (!urlRef.current) {
        urlRef.current = url
        console.log('[GameState] Setting URL:', url)
      }

      console.log('[GameState] Fetching game state from:', url)

      try {
        const result = await execute(url, { isProxy: true })

        if (result?.content) {
          console.log('[GameState] HTML content received, length:', result.content.length)
          const states = extractGameStateFromHtml(result.content)
          console.log('[GameState] Extracted', states.length, 'game state(s)')

          states.forEach((state, index) => {
            console.log(`[GameState] State ${index + 1}:`, {
              timeRemaining: state.timeRemaining,
              period: state.period,
              status: state.status,
              elementCount: Object.keys(state.elements || {}).length
            })
          })

          const timestamp = Date.now()
          setTimestamp(timestamp)
          console.log('[GameState] Timestamp updated:', timestamp)
          return states
        }

        console.log('[GameState] No content received from API')
        return []
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[GameState] Error fetching game state:', message, error)
        return []
      }
    },
    [execute]
  )

  const startPolling = useCallback(
    (url?: string) => {
      if (isPollingRef.current) {
        console.log('[GameState] Already polling, skipping start')
        return // Already polling
      }

      console.log('[GameState] Starting polling with interval:', pollInterval, 'ms')

      if (url) {
        urlRef.current = url
        console.log('[GameState] URL set to:', url)
      }

      setIsPolling(true)
      isPollingRef.current = true

      // Initial fetch
      console.log('[GameState] Performing initial fetch...')
      startTransition(() => {
        fetchGameState(url).then((states) => {
          console.log('[GameState] Initial fetch completed, found', states.length, 'state(s)')
          setGameStates(states)
        })
      })

      // Set up polling interval
      if (intervalRef.current) {
        console.log('[GameState] Clearing existing interval')
        clearInterval(intervalRef.current)
      }

      console.log('[GameState] Creating polling interval')
      intervalRef.current = setInterval(() => {
        if (isPollingRef.current) {
          console.log('[GameState] Interval tick - fetching game state...')
          startTransition(() => {
            fetchGameState().then((states) => {
              console.log('[GameState] Poll completed, found', states.length, 'state(s)')
              setGameStates(states)
            })
          })
        } else {
          console.log('[GameState] Polling ref is false, skipping fetch')
        }
      }, pollInterval)
    },
    [fetchGameState, pollInterval]
  )

  const stopPolling = useCallback(() => {
    console.log('[GameState] Stopping polling')
    setIsPolling(false)
    isPollingRef.current = false

    if (intervalRef.current) {
      console.log('[GameState] Clearing polling interval')
      clearInterval(intervalRef.current)
      intervalRef.current = null
    } else {
      console.log('[GameState] No interval to clear')
    }
  }, [])

  // Update game states when API data changes
  useEffect(() => {
    if (api.data?.content) {
      console.log('[GameState] API data changed, parsing game state...')
      try {
        const states = extractGameStateFromHtml(api.data.content)
        console.log('[GameState] Parsed', states.length, 'game state(s) from API data')
        setGameStates(states)
      } catch (error) {
        console.error('[GameState] Error parsing game state:', error)
      }
    }
  }, [api.data])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        console.log('[GameState] Cleaning up interval on unmount')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isPollingRef.current = false
    }
  }, [])

  return {
    gameStates,
    isLoading: api.isLoading,
    isError: api.isError,
    error: api.error,
    timestamp,
    isPolling,
    startPolling,
    stopPolling
  }
}
