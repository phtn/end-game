'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Card } from '../ui/card'

export const PlayCardInteractive = ({ expanded }: { expanded: boolean }) => {
  const constantDelay = 0.01 // Constant delay between each child

  return (
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
              className='select-none flex items-center justify-center size-full aspect-square font-brk cursor-pointer'>
              <div
                className={cn(
                  'aspect-square text-lg rounded-full border border-white bg-zinc-500/10 size-14 font-bold flex items-center justify-center',
                  { 'size-9 text-sm': expanded }
                )}>
                {row}
                {col}
              </div>
            </motion.div>
          )
        })}
      </Card>
    </motion.div>
  )
}
