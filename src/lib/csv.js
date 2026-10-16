// Small RFC 4180 style parser: quoted fields, escaped quotes, commas/newlines inside quotes, CRLF, BOM.
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const src = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Turns CSV text into guests. Needs name and email columns (header row), notes is optional.
// Returns { guests, errors } where errors are human readable and mention the line number.
export function guestsFromCsv(text) {
  const rows = parseCsv(text)
  if (rows.length === 0) return { guests: [], errors: ['The file is empty'] }
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const col = (names) => header.findIndex((h) => names.includes(h))
  const nameCol = col(['name', 'full name', 'guest'])
  const emailCol = col(['email', 'email address', 'e-mail'])
  const notesCol = col(['notes', 'note'])
  if (nameCol < 0 || emailCol < 0) return { guests: [], errors: ['The first row must have "name" and "email" columns'] }
  const guests = []
  const errors = []
  const seen = new Set()
  rows.slice(1).forEach((r, i) => {
    const line = i + 2
    const name = (r[nameCol] || '').trim()
    const email = (r[emailCol] || '').trim()
    if (!name) return errors.push(`Line ${line}: name is missing`)
    if (!EMAIL.test(email)) return errors.push(`Line ${line}: "${email}" is not a valid email`)
    if (seen.has(email.toLowerCase())) return errors.push(`Line ${line}: ${email} appears twice in the file`)
    seen.add(email.toLowerCase())
    guests.push({ name, email, ...(notesCol >= 0 && r[notesCol]?.trim() && { notes: r[notesCol].trim() }) })
  })
  if (guests.length > 500) errors.push('Upload at most 500 guests at a time')
  return { guests, errors }
}
