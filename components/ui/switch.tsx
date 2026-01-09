'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className={cn('inline-flex items-center cursor-pointer', className)}>
        <input
          type='checkbox'
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className='sr-only peer'
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out",
            "bg-muted peer-checked:bg-primary",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
          )}>
          <div
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-200 ease-in-out",
              "peer-checked:translate-x-5"
            )}
          />
        </div>
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
