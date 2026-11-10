import {readFileSync} from "node:fs"
import {TraceMap,originalPositionFor} from "@jridgewell/trace-mapping"

if (process.argv.slice(2).some((arg) => arg === '--help' || arg === '-h')) {
    console.log(`Usage: node map-error.mjs <map-file> <source-file> <line> [column]

Map a position in generated JavaScript (such as a stack trace) to original source.

Arguments:
  map-file     Path to the generated JavaScript's .map file
  source-file  Original source path suffix, checked against the map's sources
  line         Line in generated JavaScript (1-based)
  column       Column in generated JavaScript (1-based; default: 1)

Options:
  -h, --help   Show this help

Example:
  node map-error.mjs node_modules/sequelize/lib/model.js.map src/model.js 1140 47

Output: original source file, line, and column (1-based).
Unmapped positions return null for line and column.`)
    process.exit(0)
}

const [mapFile,sourceFile,line,column = "1"] = process.argv.slice(2)

const data = JSON.parse(readFileSync(mapFile,"utf8"))
const map = new TraceMap(data)

const source = data.sources.find((s) => s.endsWith(sourceFile))

if (!source) throw new Error('Source not in map')

const position = originalPositionFor(map, {
    line: Number(line),
    column: Number(column) - 1
})

console.log({
    file: position.source,
    line: position.line,
    column: position.column === null ? null : position.column + 1
})
