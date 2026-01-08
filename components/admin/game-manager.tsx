'use client'

// import { useAppStore } from '@/lib/store'
// import { useState } from 'react'
import { GamesQuery } from './games-query'

export default function GameManager() {
  // const { leagues, addGame } = useAppStore()
  // const [, setIsAdding] = useState(false)
  // const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  // const [newGame, setNewGame] = useState({
  //   homeTeamId: '',
  //   awayTeamId: '',
  //   date: '',
  //   time: ''
  // })

  // const handleAddGame = () => {
  //   if (selectedLeague && newGame.homeTeamId && newGame.awayTeamId && newGame.date) {
  //     const dateTime = new Date(`${newGame.date}T${newGame.time || '00:00'}`)
  //     addGame({
  //       id: Date.now().toString(),
  //       leagueId: selectedLeague,
  //       homeTeamId: newGame.homeTeamId,
  //       awayTeamId: newGame.awayTeamId,
  //       homeTeamScore: {
  //         q1: 0,
  //         q2: 0,
  //         q3: 0,
  //         q4: 0,
  //         total: 0
  //       },
  //       awayTeamScore: {
  //         q1: 0,
  //         q2: 0,
  //         q3: 0,
  //         q4: 0,
  //         total: 0
  //       },
  //       date: dateTime.toISOString(),
  //       status: 'scheduled'
  //     })
  //     setNewGame({ homeTeamId: '', awayTeamId: '', date: '', time: '' })
  //     setSelectedLeague('')
  //     setIsAdding(false)
  //   }
  // }

  // const currentLeague = selectedLeague && leagues[selectedLeague]

  // const handleSelectLeague = (value: string | null) => {
  //   setSelectedLeague(value)
  // }

  return (
    <div className='space-y-4'>
      {/*<SectionHeader title='upcoming' actionFn={() => setIsAdding(!isAdding)} actionIcon={isAdding ? 'x' : '+'} />*/}
      <GamesQuery />
    </div>
  )
}
