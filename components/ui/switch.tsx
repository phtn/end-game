'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import { Input } from './input'

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
        <Input
          type='checkbox'
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className='sr-only peer'
          {...props}
        />
        <div
          className={cn(
            'relative w-11 h-6 rounded-full transition-all duration-200 ease-in-out',
            'bg-muted/40 peer-checked:bg-primary',
            'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
            'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
          )}>
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background/40 shadow-sm transition-transform duration-200 ease-in-out',
              checked && 'translate-x-5'
            )}
          />
        </div>
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
