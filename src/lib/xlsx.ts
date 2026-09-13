import { strFromU8, unzipSync } from 'fflate'

function localTags(root: Document | Element, name: string) {
  return [...root.getElementsByTagName('*')].filter((node) => node.localName === name)
}

function parseXml(text: string) {
  return new DOMParser().parseFromString(text, 'application/xml')
}

function columnIndex(ref: string) {
  const letters = ref.replace(/\d+/g, '')
  let index = 0
  for (const ch of letters) {
    index = index * 26 + (ch.toUpperCase().charCodeAt(0) - 64)
  }
  return Math.max(0, index - 1)
}

function sharedStrings(xmlText: string) {
  const doc = parseXml(xmlText)
  return localTags(doc, 'si').map((node) => node.textContent ?? '')
}

function sheetToRows(xmlText: string, strings: string[]) {
  const doc = parseXml(xmlText)
  const rows: string[][] = []

  for (const row of localTags(doc, 'row')) {
    const line: string[] = []
    for (const cell of localTags(row, 'c')) {
      const ref = cell.getAttribute('r') ?? 'A1'
      const col = columnIndex(ref)
      const type = cell.getAttribute('t')
      let value = ''
      if (type === 's') {
        const index = Number(localTags(cell, 'v')[0]?.textContent ?? '')
        value = strings[index] ?? ''
      } else if (type === 'inlineStr' || type === 'str') {
        value = localTags(cell, 't')[0]?.textContent ?? cell.textContent ?? ''
      } else if (type === 'b') {
        value = localTags(cell, 'v')[0]?.textContent === '1' ? 'true' : 'false'
      } else {
        value = localTags(cell, 'v')[0]?.textContent ?? ''
      }
      line[col] = value.trim()
    }
    const width = line.length
    rows.push(Array.from({ length: width }, (_, index) => line[index] ?? ''))
  }

  return rows.filter((row) => row.some((cell) => cell !== ''))
}

function firstSheetPath(files: Record<string, Uint8Array>) {
  const workbook = files['xl/workbook.xml']
  if (workbook) {
    const doc = parseXml(strFromU8(workbook))
    const first = localTags(doc, 'sheet')[0]
    const name = first?.getAttribute('name')
    if (name) {
      const match = Object.keys(files).find((path) => path.includes('worksheets/sheet1'))
      if (match) return match
    }
  }
  const fallback = Object.keys(files).find((path) => /xl\/worksheets\/sheet1\.xml$/i.test(path))
  if (fallback) return fallback
  return Object.keys(files).find((path) => /xl\/worksheets\/sheet\d+\.xml$/i.test(path))
}

export async function parseXlsxRows(file: File): Promise<string[][]> {
  const unzipped = unzipSync(new Uint8Array(await file.arrayBuffer()))
  const stringsFile = unzipped['xl/sharedStrings.xml']
  const strings = stringsFile ? sharedStrings(strFromU8(stringsFile)) : []
  const sheetPath = firstSheetPath(unzipped)
  if (!sheetPath || !unzipped[sheetPath]) {
    throw new Error('No worksheet found in this Excel file.')
  }
  const rows = sheetToRows(strFromU8(unzipped[sheetPath]), strings)
  if (rows.length === 0) throw new Error('The spreadsheet is empty.')
  return rows
}
