import { useEffect } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
    .filter(el => el.offsetParent !== null || el === document.activeElement)
}

/**
 * Traps keyboard focus inside a container element while `active` is true.
 * - Auto-focuses the first focusable element on activation.
 * - Wraps Tab / Shift+Tab so focus cannot leave the container.
 * - Restores focus to the previously-focused element on cleanup.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: React.RefObject<T>,
  active: boolean,
) {
  useEffect(() => {
    if (!active || !ref.current) return

    const node = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = getFocusable(node)
    focusables[0]?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = getFocusable(node)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', handler)
    return () => {
      node.removeEventListener('keydown', handler)
      previouslyFocused?.focus()
    }
  }, [active, ref])
}
