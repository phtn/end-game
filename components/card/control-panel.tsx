'use client'

import { PlayCardItem, usePlayCard, usePlayCardHydrated } from '@/hooks/use-play-card'
import { analyzeBets, BetAnalysis, CombinationScore } from '@/lib/bet/scoring'
import { Bet } from '@/lib/bet/types'
import { Icon } from '@/lib/icons'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../ui/drawer'

interface ControlPanelProps {
  onExpand?: VoidFunction
}

// Convert PlayCardItem record to Bet array
function toBets(items: Record<string, PlayCardItem>): Bet[] {
  return Object.values(items).map((item) => ({
    id: item.id,
    name: item.name,
    amount: item.amount,
    notes: item.notes
  }))
}

interface AnalysisSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysis: BetAnalysis
  bestCombo: CombinationScore | undefined
}

const AnalysisSheet = ({ open, onOpenChange, analysis, bestCombo }: AnalysisSheetProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='font-brk text-lg'>Bet Analysis</DrawerTitle>
          <DrawerDescription>Risk exposure and optimal combinations</DrawerDescription>
        </DrawerHeader>

        <div className='px-4 pb-6 space-y-6 overflow-y-auto flex-1'>
          {/* Best Next Combo */}
          {bestCombo && (
            <section className='rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4'>
              <h3 className='font-brk text-emerald-600 dark:text-emerald-400 text-sm mb-2'>Best Next Combo</h3>
              <div className='flex items-center gap-4'>
                <span className='text-4xl font-polysans font-bold text-emerald-600 dark:text-emerald-400'>
                  {bestCombo.winnerDigit}-{bestCombo.loserDigit}
                </span>
                <div className='text-sm text-muted-foreground'>
                  <div>Winner digit: {bestCombo.winnerDigit}</div>
                  <div>Loser digit: {bestCombo.loserDigit}</div>
                  <div>Risk score: {bestCombo.score.toFixed(0)}</div>
                </div>
              </div>
            </section>
          )}

          {/* Risk Overview */}
          <section>
            <h3 className='font-brk text-muted-foreground text-sm mb-3'>Risk Overview</h3>
            <div className='grid grid-cols-3 gap-3'>
              <div className='rounded-lg bg-muted/50 p-3 text-center'>
                <div className='text-xs text-muted-foreground'>Total Exposure</div>
                <div className='font-polysans font-medium text-lg'>₱{analysis.totalExposure.toFixed(0)}</div>
              </div>
              <div className='rounded-lg bg-muted/50 p-3 text-center'>
                <div className='text-xs text-muted-foreground'>Max Payout</div>
                <div className='font-polysans font-medium text-lg'>₱{analysis.maxSinglePayout.toFixed(0)}</div>
              </div>
              <div className='rounded-lg bg-muted/50 p-3 text-center'>
                <div className='text-xs text-muted-foreground'>Risk Score</div>
                <div className='font-polysans font-medium text-lg'>{analysis.riskScore.toFixed(0)}</div>
              </div>
            </div>
          </section>

          {/* Top 5 Best Combos */}
          {analysis.bestCombinations.length > 0 && (
            <section>
              <h3 className='font-brk text-muted-foreground text-sm mb-3'>Top Low-Risk Combos</h3>
              <div className='flex flex-wrap gap-2'>
                {analysis.bestCombinations.map((combo, i) => (
                  <div
                    key={combo.id}
                    className='rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-center min-w-[60px]'>
                    <div className='font-polysans font-bold text-emerald-600 dark:text-emerald-400'>
                      {combo.winnerDigit}-{combo.loserDigit}
                    </div>
                    <div className='text-[10px] text-muted-foreground'>#{i + 1}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Worst 5 Combos to Avoid */}
          {analysis.worstCombinations.length > 0 && (
            <section>
              <h3 className='font-brk text-muted-foreground text-sm mb-3'>High-Risk Combos</h3>
              <div className='flex flex-wrap gap-2'>
                {analysis.worstCombinations.map((combo, i) => (
                  <div
                    key={combo.id}
                    className='rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-center min-w-[60px]'>
                    <div className='font-polysans font-bold text-rose-600 dark:text-rose-400'>
                      {combo.winnerDigit}-{combo.loserDigit}
                    </div>
                    <div className='text-[10px] text-muted-foreground'>#{i + 1}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Digit Exposure Bars */}
          <section>
            <h3 className='font-brk text-muted-foreground text-sm mb-3'>Winner Digit Exposure</h3>
            <div className='space-y-1'>
              {analysis.winnerDigitExposure.map((exposure, digit) => {
                const max = Math.max(...analysis.winnerDigitExposure, 1)
                const pct = (exposure / max) * 100
                return (
                  <div key={digit} className='flex items-center gap-2 text-xs'>
                    <span className='w-4 text-muted-foreground font-mono'>{digit}</span>
                    <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                      <div className='h-full bg-sky-500/70 rounded-full transition-all' style={{ width: `${pct}%` }} />
                    </div>
                    <span className='w-12 text-right text-muted-foreground'>₱{exposure.toFixed(0)}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h3 className='font-brk text-muted-foreground text-sm mb-3'>Loser Digit Exposure</h3>
            <div className='space-y-1'>
              {analysis.loserDigitExposure.map((exposure, digit) => {
                const max = Math.max(...analysis.loserDigitExposure, 1)
                const pct = (exposure / max) * 100
                return (
                  <div key={digit} className='flex items-center gap-2 text-xs'>
                    <span className='w-4 text-muted-foreground font-mono'>{digit}</span>
                    <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-amber-500/70 rounded-full transition-all'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className='w-12 text-right text-muted-foreground'>₱{exposure.toFixed(0)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export const ControlPanel = ({ onExpand }: ControlPanelProps) => {
  const [analysisOpen, setAnalysisOpen] = useState(false)

  // Ensure hydration happens
  usePlayCardHydrated()
  // Subscribe to items changes to trigger re-render
  const items = usePlayCard((state) => state.items)

  // Compute stats directly from subscribed items
  const filledItems = Object.values(items)
  const filledCount = filledItems.length
  const totalAmount = filledItems.reduce((sum, item) => sum + item.amount, 0)
  const amounts = filledItems.map((item) => item.amount)
  const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0
  const highestItem = filledItems.length > 0 ? filledItems.find((item) => item.amount === highestAmount) : undefined
  const average = filledCount > 0 ? totalAmount / filledCount : 0

  // Compute analysis
  const analysis = useMemo(() => {
    const bets = toBets(items)
    return analyzeBets(bets)
  }, [items])

  const bestCombo = analysis.bestCombinations[0]

  const stats = [
    { label: 'Fill', value: filledCount.toFixed(0) },
    { label: 'Sum', value: totalAmount.toFixed(0) },
    { label: 'Avg', value: average.toFixed(0) },
    { label: 'High', value: highestAmount.toFixed(0) },
    {
      label: 'Best',
      value: bestCombo ? `${bestCombo.winnerDigit}-${bestCombo.loserDigit}` : '—',
      action: () => setAnalysisOpen(true)
    }
  ]

  return (
    <>
      <section className='mb-0 shadow-none border-t h-18 grid grid-cols-6 gap-0 text-xs'>
        {stats.map((stat) => (
          <button
            key={stat.label}
            type='button'
            onClick={stat.action}
            disabled={!stat.action}
            className='flex flex-col items-center justify-center disabled:cursor-default hover:bg-muted/50 transition-colors rounded'>
            <div className='text-muted-foreground font-brk'>{stat.label}</div>
            <div className='font-medium capitalize font-polysans'>{stat.value}</div>
          </button>
        ))}
        <div className='flex items-center justify-center'>
          <Button onClick={onExpand} size='icon' variant='ghost' className='rounded-full'>
            <Icon name='maximize' className='size-5' />
          </Button>
        </div>
      </section>

      <AnalysisSheet open={analysisOpen} onOpenChange={setAnalysisOpen} analysis={analysis} bestCombo={bestCombo} />
    </>
  )
}
