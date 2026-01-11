import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'
import { ReactNode } from 'react'

interface ScrollAreaProps {
  children?: ReactNode
}
export const ScrollArea = ({ children }: ScrollAreaProps) => {
  return (
    <ScrollAreaPrimitive.Root className='overflow-scroll'>
      <ScrollAreaPrimitive.Viewport className='h-full overflowscroll-contain'>
        <ScrollAreaPrimitive.Content>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar>
        <ScrollAreaPrimitive.Thumb />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
