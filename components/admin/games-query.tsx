import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useScores } from '@/hooks/use-scores'
import type { MatchScore } from '@/lib/radon/extractor'
import { cn } from '@/lib/utils'
import { startTransition, useEffect, useState } from 'react'

export const GamesQuery = () => {
  const { matches, isLoading, isError, error, fetchScores, reset, lastQueryParams, lastUrl } = useScores()
  const [activeFilter, setActiveFilter] = useState<'euro' | 'pba' | 'nba'>('euro')
  const [showDebug, setShowDebug] = useState(false)

  const handleFetch = (filter: 'euro' | 'pba' | 'nba') => {
    startTransition(() => {
      setActiveFilter(filter)
      if (filter === 'euro') fetchScores({ tournament: '138' })
      else if (filter === 'pba') fetchScores({ tournament: '1956', date: '2026-01-09', live: false })
      else if (filter === 'nba') fetchScores({ tournament: '132' })
    })
  }

  // Initial fetch
  useEffect(() => {
    startTransition(() => {
      fetchScores()
    })
  }, [fetchScores])

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
            {matches.map((match, i) => (
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
                  {match.quarterScores.home.length > 0 && (
                    <div>
                      Quarters: H[{match.quarterScores.home.join(', ')}] A[{match.quarterScores.away.join(', ')}]
                    </div>
                  )}
                </div>
              </div>
            ))}
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
          <MatchCard key={`${match.homeTeam}-${match.awayTeam}-${i}`} match={match} index={i} />
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

const MatchCard = ({ match, index }: { match: MatchScore; index: number }) => {
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
        {/* Could add league or time info here if available */}
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
