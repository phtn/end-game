import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useScores } from './use-scores'
import { findTeamByName } from '@/lib/utils/team-matcher'
import { startTransition } from 'react'
import type { Game } from '@/lib/store'

const DEFAULT_GAME_CHECK_KEY = 'default-game-checked'

/**
 * Hook to automatically add a default game (second PBA game) if no games exist
 */
export function useDefaultGame() {
  const { games, addGame, leagues } = useAppStore()
  const { fetchScores } = useScores()
  const hasCheckedRef = useRef(false)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    // Prevent concurrent runs
    if (isProcessingRef.current) return
    
    // Check if there are any current games (live or scheduled)
    const now = new Date()
    const hasCurrentGames = games.some((g) => {
      const gameTime = new Date(g.date)
      // Check for live games
      if (g.status === 'live' && gameTime <= now) return true
      // Check for scheduled games that are today or upcoming (within next 24 hours)
      if (g.status === 'scheduled') {
        const hoursUntilGame = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60)
        return hoursUntilGame >= -1 && hoursUntilGame <= 24
      }
      return false
    })

    // If there are current games, don't add default
    if (hasCurrentGames) {
      console.log('[DefaultGame] Current games found, skipping default game', games.length)
      return
    }

    // No current games - check if we've already added a default game recently (within last 5 seconds)
    // This prevents rapid duplicate additions
    const lastCheckTime = sessionStorage.getItem(`${DEFAULT_GAME_CHECK_KEY}-time`)
    if (lastCheckTime) {
      const timeSinceLastCheck = Date.now() - parseInt(lastCheckTime, 10)
      if (timeSinceLastCheck < 5000) {
        console.log('[DefaultGame] Recently checked, skipping to prevent duplicates')
        return
      }
    }

    console.log('[DefaultGame] No current games found, adding default game')
    isProcessingRef.current = true
    sessionStorage.setItem(`${DEFAULT_GAME_CHECK_KEY}-time`, Date.now().toString())

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

        // Check if this game already exists (same teams) - get fresh games from store
        const currentGames = useAppStore.getState().games
        const gameExists = currentGames.some(
          (g) =>
            g.leagueId === leagueId &&
            ((g.homeTeamId === homeTeamMatch.teamId && g.awayTeamId === awayTeamMatch.teamId) ||
              (g.homeTeamId === awayTeamMatch.teamId && g.awayTeamId === homeTeamMatch.teamId))
        )

        if (gameExists) {
          console.log('[DefaultGame] Game already exists, skipping')
          isProcessingRef.current = false
          return
        }

        // Double-check: verify there are still no current games before adding
        const now = new Date()
        const stillHasCurrentGames = currentGames.some((g) => {
          const gameTime = new Date(g.date)
          if (g.status === 'live' && gameTime <= now) return true
          if (g.status === 'scheduled') {
            const hoursUntilGame = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60)
            return hoursUntilGame >= -1 && hoursUntilGame <= 24
          }
          return false
        })

        if (stillHasCurrentGames) {
          console.log('[DefaultGame] Current games appeared while processing, skipping')
          isProcessingRef.current = false
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
        // Remove the time check on error so it can retry
        sessionStorage.removeItem(`${DEFAULT_GAME_CHECK_KEY}-time`)
      } finally {
        isProcessingRef.current = false
      }
    }

    startTransition(() => {
      addDefaultGame()
    })
    // Re-run when games change so it can add default game if all games are deleted
  }, [games.length, fetchScores, addGame, leagues])
}
