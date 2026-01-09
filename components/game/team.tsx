import { Game, Score as IScore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ScoreProps {
  id: string
  score?: number
}

export const Score = ({ id, score }: ScoreProps) => {
  return (
    <div id={id} className='flex-1 flex justify-center'>
      <div className='select-none text-4xl font-brk font-light tracking-tight text-primary leading-none'>{score}</div>
    </div>
  )
}

interface TimePeriodProps {
  period: string
  timeRemaining?: string
}

export const TimePeriod = ({ period, timeRemaining }: TimePeriodProps) => {
  return (
    <div className='flex flex-col items-center gap-0'>
      <div className='text-sm font-semibold font-polysans uppercase'>{period}</div>
      {timeRemaining && <div className='text-xs font-brk text-foreground'>{timeRemaining}</div>}
    </div>
  )
}

interface QuarterScoreProps {
  game: Game
}

export const QuarterScore = ({ game }: QuarterScoreProps) => {
  return (
    <div className='flex flex-col items-start gap-y-0.5'>
      <div className='flex items-center gap-x-1 text-xs font-brk uppercase border-b border-zinc-500/0 border-dotted'>
        <TeamId id={game.homeTeamId} />
        <ScoresRow score={game.homeTeamScore} />
      </div>

      <div className='flex items-center gap-x-1 text-xs font-brk uppercase'>
        <TeamId id={game.awayTeamId} />
        <ScoresRow score={game.awayTeamScore} />
      </div>
    </div>
  )
}

export const TeamId = ({ id }: { id: string }) => {
  return (
    <div className='w-7 md:w-10 flex items-center justify-center font-bold opacity-70 border-0 border-black/20'>
      {id}
    </div>
  )
}

interface ScorePropssRow {
  score: IScore
}

const ScoresRow = ({ score }: ScorePropssRow) => {
  const scores = [score.q1 ?? null, score.q2 ?? null, score.q3 ?? null, score.q4 ?? null, score.total ?? null]

  return (
    <div className='grid grid-cols-5 gap-x-0'>
      {scores.map((value, i) => (
        <div
          key={`score-${i}`}
          className={cn(`w-5 md:w-6 text-right ${i === 4 ? 'font-bold w-6' : ''}`, {
            'bg-zinc-50 rounded-sm': value === null
          })}>
          {value ?? ''}
        </div>
      ))}
    </div>
  )
}
