'use client'

import { create } from 'zustand'
import { useEffect } from 'react'

export interface PlayCardItem {
  id: string // Format: "row-col" (e.g., "0-0", "5-3")
  name: string
  amount: number
  notes?: string
}

interface PlayCardState {
  items: Record<string, PlayCardItem>
  _hydrated: boolean
  hydrate: () => void
  getItem: (id: string) => PlayCardItem | undefined
  setItem: (item: PlayCardItem) => void
  deleteItem: (id: string) => void
  clearAll: () => void
  getStats: () => {
    filledCount: number
    totalAmount: number
    highestAmount: number
    highestItem: PlayCardItem | undefined
    average: number
  }
}

const STORAGE_KEY = 'play-card-items'

function loadFromStorage(): Record<string, PlayCardItem> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as Record<string, PlayCardItem>
    }
  } catch (error) {
    console.error('Failed to load play card items from localStorage:', error)
  }
  return {}
}

function saveToStorage(items: Record<string, PlayCardItem>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save play card items to localStorage:', error)
  }
}

export const usePlayCard = create<PlayCardState>((set, get) => ({
  items: {},
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return
    const loaded = loadFromStorage()
    set({ items: loaded, _hydrated: true })
  },

  getItem: (id: string) => {
    return get().items[id]
  },

  setItem: (item: PlayCardItem) => {
    const newItems = {
      ...get().items,
      [item.id]: item
    }
    set({ items: newItems })
    saveToStorage(newItems)
  },

  deleteItem: (id: string) => {
    const newItems = { ...get().items }
    delete newItems[id]
    set({ items: newItems })
    saveToStorage(newItems)
  },

  clearAll: () => {
    set({ items: {} })
    saveToStorage({})
  },

  getStats: () => {
    const items = get().items
    const filledItems = Object.values(items)
    const filledCount = filledItems.length
    const totalAmount = filledItems.reduce((sum, item) => sum + item.amount, 0)
    const amounts = filledItems.map((item) => item.amount)
    const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0
    const highestItem =
      filledItems.length > 0
        ? filledItems.find((item) => item.amount === highestAmount)
        : undefined
    const average = filledCount > 0 ? totalAmount / filledCount : 0

    return {
      filledCount,
      totalAmount,
      highestAmount,
      highestItem,
      average
    }
  }
}))

// Hook to ensure hydration happens
export function usePlayCardHydrated() {
  const hydrate = usePlayCard((state) => state.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
}
