import { parseMatchesFromHtml, type MatchScore } from '@/lib/radon/extractor'
import { useCallback, useMemo, useState } from 'react'
import { useApiCall } from './use-api-call'

const SPORT_URL = process.env.RADON_URL || 'https://statshub.sportradar.com/betika/en/sport'

// Tournament IDs for different sports/leagues
export const TOURNAMENTS = {
  PBA: '1956', // PBA Basketball
  BASKETBALL: '2' // General basketball sport
} as const

type TournamentKey = keyof typeof TOURNAMENTS

interface HtmlProxyResponse {
  type: 'html'
  content: string
}

interface ScoresState {
  matches: MatchScore[]
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: string | null
  timestamp: number | null
  lastQueryParams: FetchScoresOptions | null
  lastUrl: string | null
}

interface UseScoresReturn extends ScoresState {
  fetchScores: (options?: FetchScoresOptions) => Promise<MatchScore[]>
  fetchLiveScores: () => Promise<MatchScore[]>
  reset: () => void
}

interface FetchScoresOptions {
  tournament?: TournamentKey | string
  live?: boolean
  date?: string
  filter?: string // e.g., "+12h" for games in next 12 hours
}

export function useScores(): UseScoresReturn {
  const api = useApiCall<HtmlProxyResponse>()

  const { execute } = api
  const [lastQueryParams, setLastQueryParams] = useState<FetchScoresOptions | null>(null)
  const [lastUrl, setLastUrl] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<number | null>(null)

  const matches = useMemo<MatchScore[]>(() => {
    if (!api.data?.content) return []

    try {
      return parseMatchesFromHtml(api.data.content)
    } catch {
      return []
    }
  }, [api.data])

  const fetchScores = useCallback(
    async (options: FetchScoresOptions = {}): Promise<MatchScore[]> => {
      const { tournament, live = false, date, filter } = options

      let url = SPORT_URL

      // Build URL based on options
      if (tournament) {
        const tournamentId =
          typeof tournament === 'string' && tournament in TOURNAMENTS
            ? TOURNAMENTS[tournament as TournamentKey]
            : tournament
        url = `${SPORT_URL}/2/tournament/${tournamentId}`
      }

      const queryParams: string[] = []
      
      // Only add status=live when explicitly requested
      if (live === true) {
        queryParams.push('status=live')
      }
      
      if (date) {
        queryParams.push(`date=${date}`)
      }
      
      if (filter) {
        queryParams.push(`filter=${encodeURIComponent(filter)}`)
      }
      
      if (queryParams.length > 0) {
        url += url?.includes('?') ? `&${queryParams.join('&')}` : `?${queryParams.join('&')}`
      }

      // Store query params and URL for debugging
      setLastQueryParams(options)
      setLastUrl(url)

      const result = await execute(url, { isProxy: true })

      if (result?.content) {
        // Store timestamp when API call succeeds
        setTimestamp(Date.now())
        try {
          return parseMatchesFromHtml(result.content)
        } catch {
          return []
        }
      }

      return []
    },
    [execute]
  )

  const fetchLiveScores = useCallback(() => {
    return fetchScores({ live: true })
  }, [fetchScores])

  const reset = useCallback(() => {
    api.reset()
    setTimestamp(null)
    setLastQueryParams(null)
    setLastUrl(null)
  }, [api])

  return {
    matches,
    isLoading: api.isLoading,
    isError: api.isError,
    isSuccess: api.isSuccess,
    error: api.error,
    timestamp,
    lastQueryParams,
    lastUrl,
    fetchScores,
    fetchLiveScores,
    reset
  }
}

/**
 * Hook specifically for PBA scores
 */
export function usePBAScores() {
  const scores = useScores()

  const fetchPBAScores = useCallback(
    (live = false) => {
      return scores.fetchScores({ tournament: 'PBA', live })
    },
    [scores]
  )

  return {
    ...scores,
    fetchPBAScores,
    fetchLivePBA: () => fetchPBAScores(true)
  }
}
/**
 * Hook to fetch and parse game scores from SportRadar
 *
 * @example
 * ```tsx
 * function ScoresComponent() {
 *   const { matches, isLoading, fetchScores, fetchLiveScores } = useScores()
 *
 *   return (
 *     <div>
 *       <button onClick={() => fetchScores({ tournament: 'PBA' })}>
 *         Load PBA Games
 *       </button>
 *       <button onClick={fetchLiveScores}>
 *         Load Live Games
 *       </button>
 *       {isLoading && <p>Loading...</p>}
 *       {matches.map((match, i) => (
 *         <div key={i}>
 *           {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
