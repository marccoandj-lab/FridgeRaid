function parseAmount(str: string): number {
  str = str.trim()
  const fractionMap: Record<string, number> = {
    '½': 0.5, '⅓': 1/3, '⅔': 2/3, '¼': 0.25, '¾': 0.75,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 1/6,
    '⅚': 5/6, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  }
  for (const [sym, val] of Object.entries(fractionMap)) {
    if (str.includes(sym)) {
      const before = str.replace(sym, '').trim()
      const num = before ? parseFloat(before) || 0 : 0
      return num + val
    }
  }
  if (str.includes('/')) {
    const parts = str.split(/\s+/)
    let total = 0
    for (const part of parts) {
      if (part.includes('/')) {
        const [n, d] = part.split('/')
        total += parseInt(n) / parseInt(d)
      } else {
        total += parseFloat(part)
      }
    }
    return total
  }
  return parseFloat(str) || 0
}

function formatAmount(n: number): string {
  if (Number.isInteger(n)) return n.toString()
  const fractionMap: [number, string][] = [
    [0.5, '½'], [0.33, '⅓'], [0.67, '⅔'], [0.25, '¼'],
    [0.75, '¾'], [0.2, '⅕'], [0.4, '⅖'], [0.6, '⅗'],
    [0.8, '⅘'], [0.17, '⅙'], [0.83, '⅚'], [0.125, '⅛'],
    [0.375, '⅜'], [0.625, '⅝'], [0.875, '⅞'],
  ]
  const whole = Math.floor(n)
  const frac = n - whole
  if (frac < 0.05) return whole.toString()
  if (frac > 0.95) return (whole + 1).toString()
  for (const [val, sym] of fractionMap) {
    if (Math.abs(frac - val) < 0.04) {
      return whole > 0 ? `${whole}${sym}` : sym
    }
  }
  return n.toFixed(1).replace(/\.0$/, '')
}

const IRREGULAR: Record<string, string> = {
  'to taste': 'to taste',
  'dash': 'dash',
  'pinch': 'pinch',
  'as needed': 'as needed',
}

export function scaleMeasure(measure: string, factor: number): string {
  const trimmed = measure.trim()
  if (!trimmed || IRREGULAR[trimmed.toLowerCase()]) return trimmed

  const match = trimmed.match(/^([\d\s\/.½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)\s*(.*)/)
  if (!match) return trimmed

  const amount = parseAmount(match[1])
  const unit = match[2].trim()
  const scaled = amount * factor

  if (scaled === 0) return trimmed

  const formatted = formatAmount(scaled)
  return unit ? `${formatted} ${unit}` : formatted
}

export function scaleIngredients(
  ingredients: { name: string; measure: string }[],
  originalServings: number,
  targetServings: number
): { name: string; measure: string }[] {
  if (originalServings === targetServings) return ingredients
  const factor = targetServings / originalServings
  return ingredients.map((ing) => ({
    ...ing,
    measure: scaleMeasure(ing.measure, factor),
  }))
}
