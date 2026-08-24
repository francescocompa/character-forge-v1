import { Moon, Sun, Sunrise } from 'lucide-react'
import type { CSSVarStyle } from './css-vars'

export type RecoverTrigger = 'SR' | 'LR' | 'Dawn'

const LABEL: Record<RecoverTrigger, string> = {
  SR: 'Short rest',
  LR: 'Long rest',
  Dawn: 'Dawn',
}

const COLOR_VAR: Record<RecoverTrigger, string> = {
  SR: 'var(--recover-sr)',
  LR: 'var(--recover-lr)',
  Dawn: 'var(--recover-dawn)',
}

const ICON: Record<RecoverTrigger, typeof Sun> = {
  SR: Sun,
  LR: Moon,
  Dawn: Sunrise,
}

/**
 * `{recover:WHEN}` — sun (SR) / moon (LR) / sunrise (Dawn), inline in prose.
 * Outline icons from the shared lucide set (D21), replacing the old
 * flat-filled shapes that read as emoji-style icon language (D23 #7).
 */
export function RecoverIcon({ when }: { when: RecoverTrigger }) {
  const style: CSSVarStyle = { '--chip-fg': COLOR_VAR[when] }
  const Icon = ICON[when]
  return <Icon className="recover-icon" style={style} role="img" aria-label={LABEL[when]} />
}
