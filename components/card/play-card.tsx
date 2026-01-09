'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { usePlayCard, usePlayCardHydrated } from '@/hooks/use-play-card'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '../ui/drawer'
import { Input } from '../ui/input'

interface PlayCardFormData {
  name: string
  amount: string
  notes: string
}

export const PlayCardInteractive = ({ expanded }: { expanded: boolean }) => {
  const constantDelay = 0.01 // Constant delay between each child
  // Ensure hydration happens
  usePlayCardHydrated()
  // Subscribe to items to trigger re-render when items change
  const items = usePlayCard((state) => state.items)
  const setItem = usePlayCard((state) => state.setItem)
  const deleteItem = usePlayCard((state) => state.deleteItem)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PlayCardFormData>({
    name: '',
    amount: '',
    notes: ''
  })
  const [showNotes, setShowNotes] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const quickAmounts = [10, 25, 50, 100, 200]

  const generateRandomName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleItemClick = (id: string) => {
    const existingItem = items[id]
    setSelectedItemId(id)
    setFormData({
      name: existingItem?.name || generateRandomName(),
      amount: existingItem?.amount.toString() || '',
      notes: existingItem?.notes || ''
    })
    setShowNotes(!!existingItem?.notes)
  }

  const handleQuickAmount = (amount: number) => {
    const currentAmount = parseFloat(formData.amount) || 0
    const newAmount = currentAmount + amount
    setFormData((prev) => ({ ...prev, amount: newAmount.toString() }))
  }

  const handleSave = () => {
    if (!selectedItemId) return

    const amount = parseFloat(formData.amount)
    if (!formData.name.trim() || isNaN(amount)) {
      return
    }

    setItem({
      id: selectedItemId,
      name: formData.name.trim(),
      amount,
      notes: formData.notes.trim() || undefined
    })

    setSelectedItemId(null)
    setFormData({ name: '', amount: '', notes: '' })
  }

  const handleDelete = () => {
    if (!selectedItemId) return
    deleteItem(selectedItemId)
    setSelectedItemId(null)
    setFormData({ name: '', amount: '', notes: '' })
    setShowNotes(false)
  }

  const handleClose = () => {
    setSelectedItemId(null)
    setFormData({ name: '', amount: '', notes: '' })
    setShowNotes(false)
  }

  return (
    <>
      <motion.div
        layout
        transition={{
          layout: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }
        }}>
        <Card className={cn('border-none grid grid-cols-5 gap-0.5 p-0', { 'grid-cols-10': expanded })}>
          {Array.from({ length: 100 }).map((_, i) => {
            const row = Math.floor(i / 10)
            const col = i % 10
            const delay = i * constantDelay
            const id = `${row}-${col}`
            const item = items[id]
            const isFilled = !!item

            return (
              <motion.div
                key={i}
                layout
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                transition={{
                  delay,
                  duration: 0.3,
                  ease: 'easeOut',
                  layout: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                onClick={() => handleItemClick(id)}
                className='select-none flex items-center justify-center size-full aspect-square font-brk cursor-pointer'>
                <div
                  className={cn(
                    'aspect-square text-lg rounded-full border border-white size-14 font-bold flex items-center justify-center',
                    {
                      'size-9 text-sm': expanded,
                      'bg-faded': !isFilled,
                      'bg-zinc-950 border-zinc-950 text-white': isFilled
                    }
                  )}>
                  {row}
                  {col}
                </div>
              </motion.div>
            )
          })}
        </Card>
      </motion.div>

      <Drawer
        open={selectedItemId !== null}
        onOpenChange={(open) => !open && handleClose()}
        direction={isDesktop ? 'right' : 'bottom'}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className='font-polysans text-3xl'>{selectedItemId}</DrawerTitle>
            <DrawerDescription>Enter the details for this play card item.</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='amount' className='text-sm font-polysans ps-2'>
                Name
              </label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='Enter name'
                className='font-brk rounded-none h-12 border-zinc-500'
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='amount' className='text-sm font-polysans ps-2'>
                Amount
              </label>
              <Input
                id='amount'
                type='number'
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder='Enter amount'
                step='0.01'
                className='font-brk rounded-none h-12 border-zinc-500'
              />
              <div className='grid grid-cols-5 gap-2 flex-wrap w-full'>
                {quickAmounts.map((amount) => (
                  <Button
                    size='lg'
                    key={amount}
                    type='button'
                    variant='default'
                    onClick={() => handleQuickAmount(amount)}
                    className='text-base font-polysans w-full'>
                    {amount}
                  </Button>
                ))}
              </div>
            </div>
            {showNotes && (
              <div className='space-y-2'>
                <label htmlFor='notes' className='text-sm font-medium'>
                  Notes
                </label>
                <Input
                  id='notes'
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder='Enter notes (optional)'
                />
              </div>
            )}
            {!showNotes && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setShowNotes(true)}
                className='w-full justify-start text-muted-foreground'>
                + Add notes
              </Button>
            )}
          </div>
          <DrawerFooter>
            <div className='flex items-center justify-between gap-2'>
              {selectedItemId && items[selectedItemId] ? (
                <Button variant='destructive' onClick={handleDelete} className='flex-1 h-12 rounded-none'>
                  Delete
                </Button>
              ) : (
                <DrawerClose asChild className='w-full flex-1'>
                  <Button variant='outline' className='h-12 rounded-none w-full'>
                    Cancel
                  </Button>
                </DrawerClose>
              )}
              <Button
                size='lg'
                onClick={handleSave}
                className='h-12 w-full flex-1 rounded-none'
                disabled={!formData.name.trim() || !formData.amount.trim()}>
                Save
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
