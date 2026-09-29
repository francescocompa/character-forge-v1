import { ShieldCheck } from 'lucide-react'
import type { CSSVarStyle } from './css-vars'

/**
 * Outright condition immunity (T28 D52) — a `conditionAdvantages` entry whose
 * compiled markup carries `{cond:X}` with no `{adv}` tag (the app's own
 * `AdvBadge` already covers the advantage-on-save case). Same lucide-outline-
 * icon-inline recipe as `RecoverIcon`.
 */
export function ImmunityIcon() {
  const style: CSSVarStyle = { '--chip-fg': 'var(--ok)' }
  return <ShieldCheck className="immunity-icon" style={style} role="img" aria-label="Immune" />
}
