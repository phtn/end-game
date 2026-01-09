'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Team, League } from '@/lib/store'
import { CldImage } from 'next-cloudinary'

interface TeamSelectorDialogProps {
  teamName: string
  league: League
  onSelect: (teamId: string) => void
  trigger: React.ReactNode
}

export function TeamSelectorDialog({ teamName, league, onSelect, trigger }: TeamSelectorDialogProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [open, setOpen] = useState(false)

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId)
    onSelect(teamId)
    setOpen(false)
    setSelectedTeamId('')
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select Team</DrawerTitle>
          <DrawerDescription>
            Team &quot;{teamName}&quot; not found. Please select from {league.name} teams:
          </DrawerDescription>
        </DrawerHeader>
        <div className='p-4'>
          <div className='grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto'>
            {league.teams.map((team) => (
              <Button
                key={team.id}
                variant={selectedTeamId === team.id ? 'default' : 'outline'}
                onClick={() => handleTeamClick(team.id)}
                className={cn(
                  'justify-start h-auto py-3 px-4 flex items-center gap-2',
                  selectedTeamId === team.id && 'ring-2 ring-primary'
                )}>
                {team.logo && (
                  <CldImage
                    src={team.logo}
                    width={32}
                    height={32}
                    alt={team.name}
                    className='object-contain'
                  />
                )}
                <span className='text-sm font-medium'>{team.name}</span>
              </Button>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
