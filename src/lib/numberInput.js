// Number inputs: keep the visible text free of leading zeros while typing.
// React only rewrites a controlled input when the rendered value changes, so
// typing "02" over an existing "2" would otherwise leave "02" on screen
// (state is unchanged, no re-render). Writing the cleaned value back to the
// event target fixes the DOM immediately, even when state does not change.
// Returns the cleaned string ('' stays ''), safe for decimal fields:
// "02" -> "2", "00.5" -> "0.5", "0.5" stays "0.5".
export function cleanNumberInput(e) {
  const raw = e.target.value
  if (raw === '') return ''
  const cleaned = raw.replace(/^(-?)0+(?=\d)/, '$1')
  if (cleaned !== raw) e.target.value = cleaned
  return cleaned
}
