/*
 * ```bash  
node map-error.mjs \
# map file
node_modules/sequelize/lib/sequelize.js.map \ 
# source file -- note that you can usually find this in the map file under sources
src/sequelize.js \
# line
896 \
# column
35
```
 * */
import {readFileSync} from "node:fs"
import {TraceMap,generatedPositionFor} from "@jridgewell/trace-mapping"

const [mapFile,sourceFile,line,column = "1"] = process.argv.slice(2)

const data = JSON.parse(readFileSync(mapFile,"utf8"))
const map = new TraceMap(data)

const source = data.sources.find((s) => s.endsWith(sourceFile))

if (!source) throw new Error('Source not in map')

const position = generatedPositionFor(map, {
    source,
    line: Number(line),
    column: Number(column) - 1
})

console.log({
    file: mapFile.replace(/\.map$/,""),
    line: position.line,
    column: position.column === null ? null : position.column + 1
})
