import { Game } from '@/lib/store'

interface ScoreProps {
  id: string
  score: number
}

export const Score = ({ id, score }: ScoreProps) => {
  return (
    <div id={id} className='flex-1 flex justify-center'>
      <div className='text-4xl font-brk font-light tracking-tight text-primary leading-none'>{score}</div>
    </div>
  )
}

interface TimePeriodProps {
  period: string
  timeRemaining: string
}

export const TimePeriod = ({ period, timeRemaining }: TimePeriodProps) => {
  return (
    <div className='flex flex-col items-center gap-0'>
      <div className='text-sm font-semibold font-polysans uppercase'>{period}</div>
      <div className='text-xs font-brk text-foreground'>{timeRemaining}</div>
    </div>
  )
}

interface QuarterScoreProps {
  game: Game
}

export const QuarterScore = ({ game }: QuarterScoreProps) => {
  return (
    <div className='flex flex-col items-start gap-0'>
      <div className='flex items-center border-b border-black/15 gap-x-1 text-xs font-brk uppercase'>
        <div className='w-7 flex items-center justify-center font-bold border-r border-black/20'>{game.homeTeamId}</div>
        <div className='grid grid-cols-5 gap-x-1.5'>
          {Object.values(game.homeTeamScore)?.map((q) => (
            <div key={q} className='w-4 last:font-bold'>
              {q}
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center gap-x-1 text-xs font-brk uppercase'>
        <div className='w-7 flex items-center justify-center font-bold opacity-70 border-r border-black/20'>
          {game.awayTeamId}
        </div>
        <div className='grid grid-cols-5 gap-x-1.5'>
          {Object.values(game.awayTeamScore)?.map((q) => (
            <div key={q} className='w-4 last:font-bold'>
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
