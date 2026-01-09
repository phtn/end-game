import type { Team, League } from '@/lib/store'

/**
 * Match a team name from API to a Team in leagues
 * Returns the team ID if found, null otherwise
 */
export function findTeamByName(teamName: string, leagues: Record<string, League>): { leagueId: string; teamId: string } | null {
  const normalizedName = teamName.toLowerCase().trim()

  for (const [leagueId, league] of Object.entries(leagues)) {
    for (const team of league.teams) {
      const teamNameLower = team.name.toLowerCase()
      const abbreviationLower = team.abbreviation?.toLowerCase() || ''

      // Exact match
      if (teamNameLower === normalizedName || abbreviationLower === normalizedName) {
        return { leagueId, teamId: team.id }
      }

      // Partial match - check if team name contains the search term or vice versa
      if (
        teamNameLower.includes(normalizedName) ||
        normalizedName.includes(teamNameLower) ||
        (abbreviationLower && normalizedName.includes(abbreviationLower))
      ) {
        return { leagueId, teamId: team.id }
      }
    }
  }

  return null
}

/**
 * Get league ID from filter type
 */
export function getLeagueIdFromFilter(filter: 'euro' | 'pba' | 'nba'): string | null {
  const mapping: Record<'euro' | 'pba' | 'nba', string> = {
    euro: 'pba', // Default to PBA for euro filter
    pba: 'pba',
    nba: 'nba'
  }
  return mapping[filter] || null
}
