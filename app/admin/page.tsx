'use client'

import { GamesManager } from '@/components/admin/games-manager'
import LeagueManager from '@/components/admin/league-manager'
import { QueryManager } from '@/components/admin/query-manager'
import TeamManager from '@/components/admin/team-manager'
import { Header } from '@/components/ui/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tabs as BaseTabs } from '@base-ui/react'
import { useState } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('leagues')
  const tabs: Array<BaseTabs.Tab.Props> = [
    {
      value: 'leagues',
      children: 'Leagues',
      className: 'data-[state=active]:bg-blue-600'
    },
    {
      value: 'teams',
      children: 'Teams',
      className: 'data-[state=active]:bg-blue-600'
    },
    {
      value: 'games',
      children: 'Games',
      className: 'data-[state=active]:bg-blue-600'
    },
    {
      value: 'query',
      children: 'Query',
      className: 'data-active:bg-blue-600'
    }
  ]

  const contents = {
    leagues: <LeagueManager />,
    teams: <TeamManager />,
    games: <GamesManager />,
    ending: <QueryManager />
  }

  return (
    <div className='min-h-screen w-screen overflow-hidden bg-linear-to-b from-zinc-900 to-zinc-950'>
      <Header title='config' icon='x' href='/' className='md:border-b-0' />
      {/* Content */}
      <main className='max-w-6xl mx-auto px-4 py-8 md:py-0'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4 h-12 dark rounded-none'>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className='rounded-none font-polysans font-medium text-sm'>
                {tab.children}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.values(contents).map((content, index) => (
            <TabsContent key={index} value={tabs[index].value} className='mt-6'>
              {content}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
