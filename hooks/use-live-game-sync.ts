import { useAppStore, type Game } from '@/lib/store'
import { findTeamByName } from '@/lib/utils/team-matcher'
import { startTransition, useEffect, useRef } from 'react'
import { useScores } from './use-scores'

/**
 * Hook to sync live games with API data
 * Matches games in store with live matches and updates scores
 */
export function useLiveGameSync() {
  const { games, updateGame } = useAppStore()
  const { fetchScores } = useScores()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)
  const fetchScoresRef = useRef(fetchScores)
  const updateGameRef = useRef(updateGame)

  // Keep refs updated
  useEffect(() => {
    fetchScoresRef.current = fetchScores
    updateGameRef.current = updateGame
  }, [fetchScores, updateGame])

  // Calculate live games count for dependency tracking
  const liveGamesCount = games.filter((g) => g.status === 'live').length

  // Set up polling for live games
  useEffect(() => {
    // console.log('[LiveSync] Effect running, liveGamesCount:', liveGamesCount)

    const syncLiveGames = async () => {
      if (isPollingRef.current) {
        // console.log('[LiveSync] Sync already in progress, skipping')
        return // Prevent concurrent syncs
      }
      isPollingRef.current = true
      // console.log('[LiveSync] Starting sync...')

      try {
        const currentGames = useAppStore.getState().games
        const currentLeagues = useAppStore.getState().leagues
        const liveGames = currentGames.filter((g) => g.status === 'live')
        // console.log(
        //   '[LiveSync] Found',
        //   liveGames.length,
        //   'live games:',
        //   liveGames.map((g) => ({ id: g.id, home: g.homeTeamId, away: g.awayTeamId }))
        // )

        if (liveGames.length === 0) {
          // console.log('[LiveSync] No live games found, skipping sync')
          isPollingRef.current = false
          return
        }

        // Group games by league
        const gamesByLeague = liveGames.reduce(
          (acc, game) => {
            if (!acc[game.leagueId]) {
              acc[game.leagueId] = []
            }
            acc[game.leagueId].push(game)
            return acc
          },
          {} as Record<string, Game[]>
        )

        // Fetch live scores for each league
        for (const [leagueId, leagueGames] of Object.entries(gamesByLeague)) {
          // Determine tournament ID from league
          let tournament: string | undefined
          if (leagueId === 'pba') {
            tournament = '1956'
          } else if (leagueId === 'nba') {
            tournament = '132'
          }

          if (!tournament) continue

          try {
            const matches = await fetchScoresRef.current({ tournament, live: true })
            // console.log('[LiveSync] Fetched matches for league', leagueId, ':', matches.length, 'matches')

            // Match each game with live matches
            for (const game of leagueGames) {
              const matchedMatch = matches.find((match) => {
                const homeTeam = currentLeagues[leagueId]?.teams.find((t) => t.id === game.homeTeamId)
                const awayTeam = currentLeagues[leagueId]?.teams.find((t) => t.id === game.awayTeamId)

                if (!homeTeam || !awayTeam) return false

                const homeMatch = findTeamByName(match.homeTeam, currentLeagues)
                const awayMatch = findTeamByName(match.awayTeam, currentLeagues)

                return (
                  homeMatch?.teamId === game.homeTeamId &&
                  awayMatch?.teamId === game.awayTeamId &&
                  homeMatch.leagueId === leagueId &&
                  awayMatch.leagueId === leagueId
                )
              })

              if (matchedMatch) {
                // console.log('[LiveSync] Matched game:', {
                //   gameId: game.id,
                //   matchedMatch: {
                //     homeTeam: matchedMatch.homeTeam,
                //     awayTeam: matchedMatch.awayTeam,
                //     status: matchedMatch.status,
                //     period: matchedMatch.period,
                //     timeRemaining: matchedMatch.timeRemaining,
                //     homeScore: matchedMatch.homeScore,
                //     awayScore: matchedMatch.awayScore,
                //     quarterScores: matchedMatch.quarterScores
                //   }
                // })

                const statusMap: Record<string, 'scheduled' | 'live' | 'finished'> = {
                  LIVE: 'live',
                  SCHEDULED: 'scheduled',
                  END: 'finished',
                  ENDED: 'finished',
                  FINAL: 'finished',
                  HT: 'live',
                  HALFTIME: 'live',
                  HALF: 'live',
                  Q1: 'live',
                  Q2: 'live',
                  Q3: 'live',
                  Q4: 'live',
                  OT: 'live'
                }

                // Determine if game is actually live or scheduled
                // A game is live if:
                // 1. Status explicitly says LIVE, HT, Q1-Q4, or OT
                // 2. OR we have a period indicator (Q1-Q4, HT, OT)
                // 3. OR we have quarter scores (game has started)
                const hasPeriod = !!matchedMatch.period
                const quarterScores = matchedMatch.quarterScores
                const hasQuarterScores = quarterScores.home.length > 0 || quarterScores.away.length > 0
                const hasNonZeroScores = matchedMatch.homeScore > 0 || matchedMatch.awayScore > 0
                const statusUpper = matchedMatch.status.toUpperCase()

                let gameStatus: 'scheduled' | 'live' | 'finished' = statusMap[statusUpper] || game.status

                // If we have quarter scores, the game has definitely started - mark as live
                if (hasQuarterScores) {
                  gameStatus = 'live'
                }
                // If status is SCHEDULED but we have evidence the game has started, mark as live
                else if (gameStatus === 'scheduled' && (hasPeriod || hasNonZeroScores)) {
                  gameStatus = 'live'
                }

                // If status is not explicitly set but we have no period and no quarter scores, it's scheduled
                if (!statusMap[statusUpper] && !hasPeriod && !hasQuarterScores && !hasNonZeroScores) {
                  gameStatus = 'scheduled'
                }
                const homeScore: Game['homeTeamScore'] = {
                  total: matchedMatch.homeScore
                }
                // Assign quarter scores - handle partial data for live games
                if (quarterScores.home.length > 0 && quarterScores.home[0] !== undefined) {
                  homeScore.q1 = quarterScores.home[0]
                }
                if (quarterScores.home.length > 1 && quarterScores.home[1] !== undefined) {
                  homeScore.q2 = quarterScores.home[1]
                }
                if (quarterScores.home.length > 2 && quarterScores.home[2] !== undefined) {
                  homeScore.q3 = quarterScores.home[2]
                }
                if (quarterScores.home.length > 3 && quarterScores.home[3] !== undefined) {
                  homeScore.q4 = quarterScores.home[3]
                }

                const awayScore: Game['awayTeamScore'] = {
                  total: matchedMatch.awayScore
                }
                if (quarterScores.away.length > 0 && quarterScores.away[0] !== undefined) {
                  awayScore.q1 = quarterScores.away[0]
                }
                if (quarterScores.away.length > 1 && quarterScores.away[1] !== undefined) {
                  awayScore.q2 = quarterScores.away[1]
                }
                if (quarterScores.away.length > 2 && quarterScores.away[2] !== undefined) {
                  awayScore.q3 = quarterScores.away[2]
                }
                if (quarterScores.away.length > 3 && quarterScores.away[3] !== undefined) {
                  awayScore.q4 = quarterScores.away[3]
                }

                // Determine period - prioritize quarter scores, then matched period, then status
                let period = matchedMatch.period

                // If we have quarter scores, determine period from them
                if (!period && hasQuarterScores) {
                  if (quarterScores.home.length >= 4 || quarterScores.away.length >= 4) {
                    period = 'Q4'
                  } else if (quarterScores.home.length >= 3 || quarterScores.away.length >= 3) {
                    period = 'Q3'
                  } else if (quarterScores.home.length >= 2 || quarterScores.away.length >= 2) {
                    period = 'Q2'
                  } else if (quarterScores.home.length >= 1 || quarterScores.away.length >= 1) {
                    period = 'Q1'
                  }
                }

                // Fallback to matched period or status if it's a period indicator
                if (!period) {
                  const statusUpper = matchedMatch.status.toUpperCase()
                  if (statusUpper.match(/^Q[1-4]/)) {
                    period = statusUpper
                  } else if (statusUpper.match(/^(HT|HALFTIME|HALF)/)) {
                    period = 'HT'
                  } else if (statusUpper.match(/^OT/)) {
                    period = 'OT'
                  }
                }

                // Determine time remaining
                // For scheduled games, timeRemaining is actually the start time
                // For live games, timeRemaining is the time left in the current quarter
                const timeRemaining = matchedMatch.timeRemaining || game.time

                const updatedGame: Game = {
                  ...game,
                  homeTeamScore: homeScore,
                  awayTeamScore: awayScore,
                  status: gameStatus,
                  period: period || game.period,
                  time: timeRemaining
                }

                // console.log('[LiveSync] Updating game:', {
                //   id: game.id,
                //   period: updatedGame.period,
                //   time: updatedGame.time,
                //   homeTotal: updatedGame.homeTeamScore.total,
                //   awayTotal: updatedGame.awayTeamScore.total
                // })

                updateGameRef.current(game.id, updatedGame)
              } else {
                // console.log('[LiveSync] No match found for game:', {
                //   gameId: game.id,
                //   homeTeamId: game.homeTeamId,
                //   awayTeamId: game.awayTeamId,
                //   availableMatches: matches.map((m) => ({ home: m.homeTeam, away: m.awayTeam }))
                // })
              }
            }
          } catch (error) {
            console.error(`Error syncing live games for league ${leagueId}:`, error)
          }
        }
      } finally {
        isPollingRef.current = false
      }
    }

    // Only set up polling if there are live games
    if (liveGamesCount > 0) {
      console.log('[LiveSync] Setting up polling for', liveGamesCount, 'live games')
      // Initial sync
      startTransition(() => {
        syncLiveGames()
      })

      // Poll every 15 seconds for live games
      if (!intervalRef.current) {
        // console.log('[LiveSync] Creating interval')
        intervalRef.current = setInterval(() => {
          // console.log('[LiveSync] Interval tick - syncing...')
          startTransition(() => {
            syncLiveGames()
          })
        }, 15000) // 15 seconds
      } else {
        // console.log('[LiveSync] Interval already exists, skipping creation')
      }
    } else {
      // console.log('[LiveSync] No live games, clearing interval')
      // Clear interval if no live games
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        // console.log('[LiveSync] Cleaning up interval')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isPollingRef.current = false
    }
    // Use liveGamesCount instead of games array to avoid re-creating interval on every update
  }, [liveGamesCount])
}
