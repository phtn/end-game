import type { League } from '@/lib/store'

// PBA team name aliases for better matching
const PBA_TEAM_ALIASES: Record<string, string[]> = {
  smb: ['san miguel', 'beermen', 's.m. beermen', 'smb', 'san miguel beermen'],
  gin: ['ginebra', 'brgy. ginebra', 'barangay ginebra', 'gin', 'ginebra san miguel'],
  bol: ['meralco', 'bolts', 'meralco bolts', 'bol'],
  tnt: ['tnt', 'tropang giga', 'talk n text', 'tropang', '5g', 'tropang 5g'],
  ros: ['rain or shine', 'ros', 'elasto painters', 'elastopainters'],
  nlx: ['nlex', 'road warriors', 'nlex road warriors', 'nlx'],
  pho: ['phoenix', 'fuel masters', 'phoenix fuel masters'],
  nor: ['northport', 'batang pier', 'northport batang pier'],
  mag: ['magnolia', 'hotshots', 'magnolia hotshots'],
  ter: ['terrafirma', 'dyip', 'terrafirma dyip'],
  con: ['converge', 'fiberxers', 'converge fiberxers'],
  blk: ['blackwater', 'bossing', 'blackwater bossing']
}

// NBA team name aliases for better matching
const NBA_TEAM_ALIASES: Record<string, string[]> = {
  no: ['new orleans', 'pelicans', 'new orleans pelicans', 'nop'],
  dal: ['dallas', 'mavericks', 'dallas mavericks', 'mavs'],
  mem: ['memphis', 'grizzlies', 'memphis grizzlies'],
  mia: ['miami', 'heat', 'miami heat'],
  lac: ['clippers', 'la clippers', 'los angeles clippers'],
  gsw: ['warriors', 'golden state', 'golden state warriors', 'dubs']
}

/**
 * Match a team name from API to a Team in leagues
 * Returns the team ID if found, null otherwise
 */
export function findTeamByName(teamName: string, leagues: Record<string, League>): { leagueId: string; teamId: string } | null {
  const normalizedName = teamName.toLowerCase().trim()

  for (const [leagueId, league] of Object.entries(leagues)) {
    // Get aliases based on league
    const aliases = leagueId === 'pba' ? PBA_TEAM_ALIASES : leagueId === 'nba' ? NBA_TEAM_ALIASES : {}

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

      // Check aliases for this team
      const teamAliases = aliases[team.id]
      if (teamAliases) {
        for (const alias of teamAliases) {
          if (
            normalizedName === alias ||
            normalizedName.includes(alias) ||
            alias.includes(normalizedName)
          ) {
            return { leagueId, teamId: team.id }
          }
        }
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
