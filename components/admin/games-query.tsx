import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useScores } from '@/hooks/use-scores'
import type { MatchScore } from '@/lib/radon/extractor'
import { cn } from '@/lib/utils'
import { startTransition, useEffect, useState, useRef } from 'react'
import { useAppStore, type Game } from '@/lib/store'
import { findTeamByName, getLeagueIdFromFilter } from '@/lib/utils/team-matcher'
import { TeamSelectorDialog } from './team-selector-dialog'
import { debugQuarterScores } from '@/lib/utils/debug-quarter-scores'

interface GamesQueryProps {
  date?: string
  live?: boolean
  filter?: string
}

export const GamesQuery = ({ date, live, filter }: GamesQueryProps = {}) => {
  const { matches, isLoading, isError, error, fetchScores, reset, lastQueryParams, lastUrl } = useScores()
  const [activeFilter, setActiveFilter] = useState<'euro' | 'pba' | 'nba'>('euro')
  const [showDebug, setShowDebug] = useState(false)
  const hasInitialized = useRef(false)

  const handleFetch = (filterType: 'euro' | 'pba' | 'nba') => {
    startTransition(() => {
      setActiveFilter(filterType)
      const params: { tournament: string; date?: string; live?: boolean; filter?: string } = { tournament: '' }
      
      if (filterType === 'euro') {
        params.tournament = '138'
      } else if (filterType === 'pba') {
        params.tournament = '1956'
      } else if (filterType === 'nba') {
        params.tournament = '132'
      }

      // Apply date, live, and filter from props if provided
      if (date) {
        params.date = date
      }
      if (live !== undefined) {
        params.live = live
      }
      if (filter) {
        params.filter = filter
      }

      fetchScores(params)
    })
  }

  // Initial fetch on mount
  useEffect(() => {
    if (!hasInitialized.current) {
    startTransition(() => {
        const params: { date?: string; live?: boolean; filter?: string } = {}
        if (date) params.date = date
        if (live !== undefined) params.live = live
        if (filter) params.filter = filter
        fetchScores(params)
        hasInitialized.current = true
      })
    }
  }, [fetchScores, date, live, filter])

  // Refetch when date/live/filter changes, preserving active filter
  useEffect(() => {
    if (hasInitialized.current) {
      startTransition(() => {
        const params: { tournament?: string; date?: string; live?: boolean; filter?: string } = {}
        
        // Preserve active filter
        if (activeFilter === 'euro') {
          params.tournament = '138'
        } else if (activeFilter === 'pba') {
          params.tournament = '1956'
        } else if (activeFilter === 'nba') {
          params.tournament = '132'
        }
        
        // Apply date, live, and filter from props
        if (date) params.date = date
        if (live !== undefined) params.live = live
        if (filter) params.filter = filter
        
        fetchScores(params)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, live, filter])

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-2 p-1 rounded-lg backdrop-blur-sm'>
          <FilterButton active={activeFilter === 'euro'} onClick={() => handleFetch('euro')}>
            All Games
          </FilterButton>
          <FilterButton active={activeFilter === 'pba'} onClick={() => handleFetch('pba')}>
            PBA
          </FilterButton>
          <FilterButton active={activeFilter === 'nba'} onClick={() => handleFetch('nba')}>
            NBA
          </FilterButton>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowDebug(!showDebug)}
            className='text-muted-foreground hover:text-foreground transition-colors'>
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => startTransition(() => reset())}
            className='text-muted-foreground hover:text-foreground transition-colors'>
            Reset
          </Button>
        </div>
      </div>

      {showDebug && (
        <div className='p-1 border border-border/40 bg-muted/20 rounded-lg text-xs font-mono space-y-2'>
          <div className='font-semibold text-sm mb-2'>Debug Info:</div>

          <div className='mb-4 pb-4 border-b border-border/40'>
            <div className='font-semibold mb-1'>Query Parameters:</div>
            <div className='pl-0 space-y-1 text-white'>
              <div className='break-all overflow-wrap-anywhere word-break-break-all'>
                <span className='text-muted-foreground'>URL:</span>{' '}
                <span className='text-foreground select-all'>{lastUrl || 'N/A'}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Tournament:</span> {lastQueryParams?.tournament || 'None'}
              </div>
              <div>
                <span className='text-muted-foreground'>Live:</span>{' '}
                {lastQueryParams?.live !== undefined ? String(lastQueryParams.live) : 'false (default)'}
              </div>
              <div>
                <span className='text-muted-foreground'>Date:</span> {lastQueryParams?.date || 'None'}
              </div>
              <div>
                <span className='text-muted-foreground'>Filter:</span> {lastQueryParams?.filter || 'None'}
              </div>
              <div className='pt-2 text-muted-foreground/80 italic text-[10px]'>
                <div className='font-semibold mb-1'>Why PBA might show live data:</div>
                <ul className='list-disc list-inside space-y-0.5'>
                  <li>When live=false, no status parameter is added (API may default to live)</li>
                  <li>Check the actual URL above to verify what query params are being sent</li>
                  <li>The API endpoint may default to live data when no status is specified</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className='font-semibold mb-1'>Matches found: {matches.length}</div>
            {matches.map((match, i) => {
              const debugInfo = match._debug
                ? debugQuarterScores(match._debug.rawScores.slice(2), match.homeScore, match.awayScore)
                : null

              return (
              <div key={i} className='pl-4 border-l-2 border-border/40 mt-2'>
                <div>Match {i + 1}:</div>
                <div className='pl-2'>
                  <div>
                    Home: &quot;{match.homeTeam}&quot; ({match.homeScore})
                  </div>
                  <div>
                    Away: &quot;{match.awayTeam}&quot; ({match.awayScore})
                  </div>
                  <div>Status: {match.status}</div>
                    {(match.period || match.timeRemaining) && (
                      <div>
                        Period: {match.period || 'N/A'}, Time: {match.timeRemaining || 'N/A'}
                      </div>
                    )}
                    <div className='mt-2 pt-2 border-t border-border/20'>
                      <div className='font-semibold text-xs mb-1'>Quarter Scores:</div>
                      {match.quarterScores.home.length > 0 ? (
                        <div className='text-xs space-y-1'>
                          <div>
                            Home: [{match.quarterScores.home.join(', ')}] (Sum:{' '}
                            {match.quarterScores.home.reduce((a, b) => a + b, 0)})
                          </div>
                    <div>
                            Away: [{match.quarterScores.away.join(', ')}] (Sum:{' '}
                            {match.quarterScores.away.reduce((a, b) => a + b, 0)})
                          </div>
                          <div className='text-muted-foreground/60 italic'>
                            Home diff: {Math.abs(match.quarterScores.home.reduce((a, b) => a + b, 0) - match.homeScore)}
                            , Away diff:{' '}
                            {Math.abs(match.quarterScores.away.reduce((a, b) => a + b, 0) - match.awayScore)}
                          </div>
                        </div>
                      ) : (
                        <div className='text-xs text-muted-foreground/60 italic'>
                          No quarter scores extracted (need at least 8 valid scores between 10-45)
                        </div>
                      )}
                      {debugInfo && (
                        <div className='mt-2 pt-2 border-t border-border/10'>
                          <div className='text-xs font-semibold mb-1'>Debug Info:</div>
                          <div className='text-xs text-muted-foreground/80 space-y-0.5'>
                            <div>Raw scores: [{debugInfo.rawScores.join(', ')}]</div>
                            <div>Valid scores (10-45): [{debugInfo.validScores.join(', ')}] ({debugInfo.validScores.length} found)</div>
                            {debugInfo.formatAnalysis.length > 0 && (
                              <div className='mt-1'>
                                <div className='font-semibold mb-0.5'>Format Analysis:</div>
                                {debugInfo.formatAnalysis.map((fmt, idx) => (
                                  <div key={idx} className='pl-2 text-[10px]'>
                                    {fmt.format}: H[{fmt.home.join(',')}] A[{fmt.away.join(',')}] - Diff: {fmt.diff}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                    </div>
                  )}
                </div>
              </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isError && (
        <div className='p-4 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive text-sm font-medium animate-in zoom-in-95'>
          Error: {error}
        </div>
      )}

      <div
        className={cn(
          'grid gap-4 transition-all duration-300 ease-in-out',
          isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100',
          'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        )}>
        {matches.map((match, i) => (
          <MatchCard
            key={`${match.homeTeam}-${match.awayTeam}-${i}`}
            match={match}
            index={i}
            activeFilter={activeFilter}
          />
        ))}

        {!isLoading && matches.length === 0 && !isError && (
          <div className='col-span-full py-12 text-center text-muted-foreground font-polysans'>
            No active games found.
          </div>
        )}
      </div>
    </div>
  )
}

const FilterButton = ({
  active,
  children,
  onClick
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-out',
      active
        ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )}>
    {children}
  </button>
)

const MatchCard = ({
  match,
  index,
  activeFilter
}: {
  match: MatchScore
  index: number
  activeFilter: 'euro' | 'pba' | 'nba'
}) => {
  const { leagues, addGame } = useAppStore()
  const [pendingTeam, setPendingTeam] = useState<{ type: 'home' | 'away'; name: string } | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const convertMatchToGame = (homeTeamId: string, awayTeamId: string): Game | null => {
    const leagueId = getLeagueIdFromFilter(activeFilter)
    if (!leagueId || !leagues[leagueId]) return null

    const statusMap: Record<string, 'scheduled' | 'live' | 'finished'> = {
      LIVE: 'live',
      END: 'finished',
      ENDED: 'finished',
      HT: 'live'
    }

    const gameStatus = statusMap[match.status.toUpperCase()] || 'scheduled'

    const quarterScores = match.quarterScores
    // Only include quarter scores if they exist and are valid numbers
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

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      leagueId,
      homeTeamId,
      awayTeamId,
      homeTeamScore: homeScore,
      awayTeamScore: awayScore,
      date: new Date().toISOString(),
      status: gameStatus,
      period: match.period || (match.status.match(/^Q[1-4]/) ? match.status : undefined),
      time: match.timeRemaining
    }
  }

  const handleAddToGames = () => {
    const leagueId = getLeagueIdFromFilter(activeFilter)
    if (!leagueId || !leagues[leagueId]) return

    const homeTeamMatch = findTeamByName(match.homeTeam, leagues)
    const awayTeamMatch = findTeamByName(match.awayTeam, leagues)

    // Check if teams need manual selection
    if (!homeTeamMatch || homeTeamMatch.leagueId !== leagueId) {
      setPendingTeam({ type: 'home', name: match.homeTeam })
      return
    }

    if (!awayTeamMatch || awayTeamMatch.leagueId !== leagueId) {
      setPendingTeam({ type: 'away', name: match.awayTeam })
      return
    }

    // Both teams found, add game
    const game = convertMatchToGame(homeTeamMatch.teamId, awayTeamMatch.teamId)
    if (game) {
      addGame(game)
    }
  }

  const handleTeamSelect = (teamId: string) => {
    if (!pendingTeam) return

    const leagueId = getLeagueIdFromFilter(activeFilter)
    if (!leagueId || !leagues[leagueId]) return

    const otherTeamName = pendingTeam.type === 'home' ? match.awayTeam : match.homeTeam
    const otherTeamMatch = findTeamByName(otherTeamName, leagues)

    // If we already have a selected team ID (from previous selection), use it
    // selectedTeamId is the first team we selected, teamId is the second team we're selecting now
    if (selectedTeamId) {
      // Determine which one is home (left) and which is away (right)
      // match.homeTeam is always left/home, match.awayTeam is always right/away
      let homeTeamId: string
      let awayTeamId: string

      if (pendingTeam.type === 'home') {
        // We're selecting home team now, so teamId is home, selectedTeamId is away
        homeTeamId = teamId
        awayTeamId = selectedTeamId
      } else {
        // We're selecting away team now, so selectedTeamId is home, teamId is away
        homeTeamId = selectedTeamId
        awayTeamId = teamId
      }

      const game = convertMatchToGame(homeTeamId, awayTeamId)
      if (game) {
        addGame(game)
        setPendingTeam(null)
        setSelectedTeamId(null)
      }
      return
    }

    // If other team also not found in the same league, store this selection and set other as pending
    if (!otherTeamMatch || otherTeamMatch.leagueId !== leagueId) {
      setSelectedTeamId(teamId)
      setPendingTeam({
        type: pendingTeam.type === 'home' ? 'away' : 'home',
        name: otherTeamName
      })
      return
    }

    // Create game with selected team and matched team
    // match.homeTeam is always left/home, match.awayTeam is always right/away
    const homeTeamId = pendingTeam.type === 'home' ? teamId : otherTeamMatch.teamId
    const awayTeamId = pendingTeam.type === 'away' ? teamId : otherTeamMatch.teamId

    const game = convertMatchToGame(homeTeamId, awayTeamId)
    if (game) {
      addGame(game)
      setPendingTeam(null)
      setSelectedTeamId(null)
    }
  }

  const leagueId = getLeagueIdFromFilter(activeFilter)
  const league = leagueId ? leagues[leagueId] : null

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/40 hover:bg-card hover:border-border/80 transition-all duration-300 group p-0',
        'animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards rounded-none'
      )}
      style={{ animationDelay: `${index * 50}ms` }}>
      <CardHeader className='py-4 px-5 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between space-y-0'>
        <span
          className={cn(
            'text-[10px] font-brk tracking-widest uppercase px-2 py-0.5 rounded-full border',
            match.status === 'LIVE'
              ? 'border-red-500/30 text-red-600 bg-red-500/5 animate-pulse'
              : 'border-border text-muted-foreground bg-muted/50'
          )}>
          {match.status}
        </span>
        {(match.period || match.timeRemaining) && (
          <div className='flex items-center gap-2'>
            {match.period && (
              <span className='text-xs font-semibold font-polysans uppercase text-foreground'>
                {match.period}
              </span>
            )}
            {match.timeRemaining && (
              <span className='text-xs font-brk text-muted-foreground'>
                {match.timeRemaining}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className='p-5'>
        <div className='flex items-center justify-between gap-6'>
          <TeamDisplay name={match.homeTeam} score={match.homeScore} isWinner={match.homeScore > match.awayScore} />
          <div className='text-muted-foreground font-brk text-xs opacity-30'>VS</div>
          <TeamDisplay
            name={match.awayTeam}
            score={match.awayScore}
            isWinner={match.awayScore > match.homeScore}
            align='right'
          />
        </div>

        {match.quarterScores && (match.quarterScores.home.length > 0 || match.quarterScores.away.length > 0) && (
          <div className='mt-6 pt-4 border-t border-border/40'>
            <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs'>
              <div className='font-polysans text-muted-foreground flex flex-col gap-1 justify-center'>
                <span className='h-4 flex items-center'>HOME</span>
                <span className='h-4 flex items-center'>AWAY</span>
              </div>
              <div className='grid grid-cols-4 gap-1'>
                {match.quarterScores.home.map((s: number, i: number) => (
                  <div key={`h-${i}`} className='flex flex-col gap-1'>
                    <span className='h-4 flex items-center justify-center font-brk bg-muted/30 rounded text-muted-foreground'>
                      {s}
                    </span>
                    <span className='h-4 flex items-center justify-center font-brk bg-muted/30 rounded text-muted-foreground'>
                      {match.quarterScores.away[i] || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className='mt-4 pt-4 border-t border-border/40'>
          {pendingTeam && league ? (
            <TeamSelectorDialog
              teamName={pendingTeam.name}
              league={league}
              onSelect={handleTeamSelect}
              trigger={
                <Button variant='outline' size='sm' className='w-full'>
                  Select {pendingTeam.type === 'home' ? 'Home' : 'Away'} Team
                </Button>
              }
            />
          ) : (
            <Button onClick={handleAddToGames} size='sm' className='w-full'>
              Add to Games
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const TeamDisplay = ({
  name,
  score,
  isWinner,
  align = 'left'
}: {
  name: string
  score: number
  isWinner: boolean
  align?: 'left' | 'right'
}) => (
  <div
    className={cn('flex flex-col gap-1 flex-1', align === 'right' ? 'items-end text-right' : 'items-start text-left')}>
    <span
      className={cn(
        'text-4xl font-brk font-light leading-none tracking-tight transition-colors duration-300',
        isWinner ? 'text-primary' : 'text-muted-foreground'
      )}>
      {score}
    </span>
    <span
      className={cn(
        'text-sm font-polysans font-medium leading-tight text-balance',
        isWinner ? 'text-foreground' : 'text-muted-foreground/80'
      )}>
      {name}
    </span>
  </div>
)
