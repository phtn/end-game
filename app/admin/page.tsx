'use client'

import GameManager from '@/components/admin/game-manager'
import LeagueManager from '@/components/admin/league-manager'
import TeamManager from '@/components/admin/team-manager'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/lib/icons'
import Link from 'next/link'
import { useState } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('leagues')

  return (
    <div className='min-h-screen bg-linear-to-b from-zinc-900 to-zinc-950'>
      {/* Header */}
      <header className='bg-zinc-900/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto px-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h1 className='text-base text-white font-brk'>config</h1>
          </div>
          <Link href='/'>
            <Button
              size='icon'
              variant='ghost'
              className='text-white rounded-full focus-within:bg-transparent hover:bg-transparent'>
              <Icon name='x' />
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className='max-w-6xl mx-auto px-4 py-8'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='leagues' className='data-[state=active]:bg-blue-600'>
              Leagues
            </TabsTrigger>
            <TabsTrigger value='teams' className='data-[state=active]:bg-blue-600'>
              Teams
            </TabsTrigger>
            <TabsTrigger value='games' className='data-[state=active]:bg-blue-600'>
              Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value='leagues' className='mt-6'>
            <LeagueManager />
          </TabsContent>

          <TabsContent value='teams' className='mt-6'>
            <TeamManager />
          </TabsContent>

          <TabsContent value='games' className='mt-6'>
            <GameManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
