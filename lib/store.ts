import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Team {
  id: string
  name: string
  abbreviation?: string
  code?: number
  logo?: string
}

export interface Score {
  q1?: number
  q2?: number
  q3?: number
  q4?: number
  total?: number
}

export interface League {
  id: string
  name: string
  sport: string
  logo?: string
  code?: number
  teams: Team[]
}

export interface Game {
  id: string
  leagueId: string
  homeTeamId: string
  awayTeamId: string
  homeTeamScore: Score
  awayTeamScore: Score
  date: string
  status: 'scheduled' | 'live' | 'finished'
  period?: string
  time?: string
}

interface AppState {
  leagues: Record<string, League>
  games: Game[]
  addLeague: (league: League) => void
  updateLeague: (id: string, league: League) => void
  deleteLeague: (id: string) => void
  addTeamToLeague: (leagueId: string, team: Team) => void
  updateTeam: (leagueId: string, teamId: string, team: Team) => void
  deleteTeam: (leagueId: string, teamId: string) => void
  addGame: (game: Game) => void
  updateGame: (id: string, game: Game) => void
  deleteGame: (id: string) => void
}

const initialLeagues = {
  pba: {
    id: 'pba',
    code: 1956,
    name: 'Philippine Basketball Association',
    sport: 'Basketball',
    logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837248/pba_logo_hsfo5n.png',
    teams: [
      {
        id: 'smb',
        name: 'San Miguel Beermen',
        logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837249/SMB_obvqvr.png'
      },
      {
        id: 'gin',
        name: 'Ginebra San Miguel',
        logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837249/GSM_nla5cp.png'
      },
      {
        id: 'bol',
        name: 'Meralco Bolts',
        logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837248/BOL_bst61v.png'
      },
      {
        id: 'tnt',
        name: 'Tropang 5G',
        logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837249/TNT_bnyqdn.png'
      },
      {
        id: 'ros',
        name: 'Rain or Shine',
        logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837249/ROS_sfoduo.png'
      },
      {
        id: 'nlx',
        name: 'NLEX Road Warriors',
        abbreviation: 'nlx',
        logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767837248/NLX_f2fv3p.png'
      }
    ]
  },
  nba: {
    id: 'nba',
    code: 132,
    name: 'National Basketball Association',
    sport: 'Basketball',
    logo: 'https://res.cloudinary.com/dx0heqhhe/image/upload/v1767856225/nba-logo_n5ozos.svg',
    teams: [
      {
        id: 'no',
        name: 'New Orleans Pelicans',
        abbreviation: 'NOP',
        logo: 'https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Pelicans_logo.svg'
      },
      {
        id: 'dal',
        name: 'Dallas Mavericks',
        abbreviation: 'DAL',
        logo: 'https://content.sportslogos.net/logos/6/228/full/ifk08eam05rwxr3yhol3whdcm.png'
      },
      {
        id: 'mem',
        name: 'Memphis Grizzlies',
        abbreviation: 'MEM',
        logo: 'https://content.sportslogos.net/logos/6/231/full/793.png'
      },
      {
        id: 'mia',
        name: 'Miami Heat',
        abbreviation: 'MIA',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg'
      },
      {
        id: 'lac',
        name: 'Los Angeles Clippers',
        abbreviation: 'LAC',
        logo: 'https://upload.wikimedia.org/wikipedia/en/9/9d/Los_Angeles_Clippers_%282015%29_logo.svg'
      },
      {
        id: 'gsw',
        name: 'Golden State Warriors',
        abbreviation: 'GSW',
        logo: 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg'
      }
    ]
  }
}

const initialGames: Game[] = []

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      leagues: initialLeagues,
      games: initialGames,

  addLeague: (league) =>
    set((state) => ({
      leagues: { ...state.leagues, [league.id]: league }
    })),

  updateLeague: (id, league) =>
    set((state) => ({
      leagues: { ...state.leagues, [id]: league }
    })),

  deleteLeague: (id) =>
    set((state) => {
      const newLeagues = { ...state.leagues }
      delete newLeagues[id]
      return { leagues: newLeagues }
    }),

  addTeamToLeague: (leagueId, team) =>
    set((state) => ({
      leagues: {
        ...state.leagues,
        [leagueId]: {
          ...state.leagues[leagueId],
          teams: [...state.leagues[leagueId].teams, team]
        }
      }
    })),

  updateTeam: (leagueId, teamId, team) =>
    set((state) => ({
      leagues: {
        ...state.leagues,
        [leagueId]: {
          ...state.leagues[leagueId],
          teams: state.leagues[leagueId].teams.map((t) => (t.id === teamId ? team : t))
        }
      }
    })),

  deleteTeam: (leagueId, teamId) =>
    set((state) => ({
      leagues: {
        ...state.leagues,
        [leagueId]: {
          ...state.leagues[leagueId],
          teams: state.leagues[leagueId].teams.filter((t) => t.id !== teamId)
        }
      }
    })),

  addGame: (game) =>
    set((state) => ({
      games: [...state.games, game]
    })),

  updateGame: (id, game) =>
    set((state) => ({
      games: state.games.map((g) => (g.id === id ? game : g))
    })),

  deleteGame: (id) =>
    set((state) => ({
      games: state.games.filter((g) => g.id !== id)
    }))
    }),
    {
      name: 'end-game-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist games, not leagues (leagues are static initial data)
      partialize: (state) => ({ games: state.games })
    }
  )
)
