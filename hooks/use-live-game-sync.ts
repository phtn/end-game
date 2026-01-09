import { useEffect, useRef } from 'react'
import { useAppStore, type Game } from '@/lib/store'
import { useScores } from './use-scores'
import { findTeamByName } from '@/lib/utils/team-matcher'
import { startTransition } from 'react'

/**
 * Hook to sync live games with API data
 * Matches games in store with live matches and updates scores
 */
export function useLiveGameSync() {
  const { games, updateGame, leagues } = useAppStore()
  const { fetchScores } = useScores()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Set up polling for live games
  useEffect(() => {
    const syncLiveGames = async () => {
      const currentGames = useAppStore.getState().games
      const currentLeagues = useAppStore.getState().leagues
      const liveGames = currentGames.filter((g) => g.status === 'live')

      if (liveGames.length === 0) return

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
          const matches = await fetchScores({ tournament, live: true })

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
              const statusMap: Record<string, 'scheduled' | 'live' | 'finished'> = {
                LIVE: 'live',
                END: 'finished',
                ENDED: 'finished',
                HT: 'live'
              }

              const gameStatus = statusMap[matchedMatch.status.toUpperCase()] || game.status

              const quarterScores = matchedMatch.quarterScores
              const homeScore: Game['homeTeamScore'] = {
                total: matchedMatch.homeScore
              }
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

              const updatedGame: Game = {
                ...game,
                homeTeamScore: homeScore,
                awayTeamScore: awayScore,
                status: gameStatus,
                period: matchedMatch.period || game.period,
                time: matchedMatch.timeRemaining || game.time
              }

              updateGame(game.id, updatedGame)
            }
          }
        } catch (error) {
          console.error(`Error syncing live games for league ${leagueId}:`, error)
        }
      }
    }

    const liveGames = games.filter((g) => g.status === 'live')

    if (liveGames.length > 0) {
      // Initial sync
      startTransition(() => {
        syncLiveGames()
      })

      // Poll every 10 seconds for live games
      intervalRef.current = setInterval(() => {
        startTransition(() => {
          syncLiveGames()
        })
      }, 10000) // 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [games, leagues, fetchScores, updateGame])
}
