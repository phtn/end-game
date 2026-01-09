import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useScores } from './use-scores'
import { findTeamByName, getLeagueIdFromFilter } from '@/lib/utils/team-matcher'
import { startTransition } from 'react'
import type { Game } from '@/lib/store'
import type { MatchScore } from '@/lib/radon/extractor'

/**
 * Hook to automatically add a default game (second PBA game) if no games exist
 */
export function useDefaultGame() {
  const { games, addGame, leagues } = useAppStore()
  const { fetchScores } = useScores()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Only run once and only if there are no games
    if (hasCheckedRef.current || games.length > 0) return

    const addDefaultGame = async () => {
      try {
        // Fetch PBA games
        const matches = await fetchScores({ tournament: '1956' }) // PBA tournament ID

        if (matches.length < 2) {
          console.log('[DefaultGame] Not enough PBA games found, skipping default game')
          return
        }

        // Get the second game (index 1)
        const match = matches[1]
        const leagueId = 'pba'

        if (!leagues[leagueId]) {
          console.log('[DefaultGame] PBA league not found')
          return
        }

        // Match teams
        const homeTeamMatch = findTeamByName(match.homeTeam, leagues)
        const awayTeamMatch = findTeamByName(match.awayTeam, leagues)

        if (!homeTeamMatch || homeTeamMatch.leagueId !== leagueId) {
          console.log('[DefaultGame] Home team not matched:', match.homeTeam)
          return
        }

        if (!awayTeamMatch || awayTeamMatch.leagueId !== leagueId) {
          console.log('[DefaultGame] Away team not matched:', match.awayTeam)
          return
        }

        // Convert match to game
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

        const hasQuarterScores = match.quarterScores.home.length > 0 || match.quarterScores.away.length > 0
        const hasNonZeroScores = match.homeScore > 0 || match.awayScore > 0
        const statusUpper = match.status.toUpperCase()
        
        let gameStatus: 'scheduled' | 'live' | 'finished' = statusMap[statusUpper] || 'scheduled'
        
        // If we have quarter scores, the game has started - mark as live
        if (hasQuarterScores) {
          gameStatus = 'live'
        } else if (gameStatus === 'scheduled' && hasNonZeroScores) {
          gameStatus = 'live'
        }

        const quarterScores = match.quarterScores
        const homeScore: Game['homeTeamScore'] = {
          total: match.homeScore
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
          total: match.awayScore
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

        // Determine period from quarter scores
        let period = match.period
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

        if (!period) {
          const statusUpper = match.status.toUpperCase()
          if (statusUpper.match(/^Q[1-4]/)) {
            period = statusUpper
          } else if (statusUpper.match(/^(HT|HALFTIME|HALF)/)) {
            period = 'HT'
          } else if (statusUpper.match(/^OT/)) {
            period = 'OT'
          }
        }

        const game: Game = {
          id: `default-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          leagueId,
          homeTeamId: homeTeamMatch.teamId,
          awayTeamId: awayTeamMatch.teamId,
          homeTeamScore: homeScore,
          awayTeamScore: awayScore,
          date: new Date().toISOString(),
          status: gameStatus,
          period,
          time: match.timeRemaining
        }

        startTransition(() => {
          addGame(game)
          console.log('[DefaultGame] Added default game:', game)
        })
      } catch (error) {
        console.error('[DefaultGame] Error adding default game:', error)
      } finally {
        hasCheckedRef.current = true
      }
    }

    startTransition(() => {
      addDefaultGame()
    })
  }, [games.length, fetchScores, addGame, leagues])
}
