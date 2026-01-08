'use client'

import { parseAsBoolean, useQueryState } from 'nuqs'
import { ControlPanel } from './control-panel'
import { PlayCardInteractive } from './play-card'

export const AnalysisCard = () => {
  const [expanded, setExpanded] = useQueryState('expanded', parseAsBoolean.withDefault(false))
  const handleExpand = () => setExpanded(!expanded)

  return (
    <section>
      <ControlPanel onExpand={handleExpand} />
      <PlayCardInteractive expanded={expanded} />
    </section>
  )
}
