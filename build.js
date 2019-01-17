const fs = require('fs')
const tsconfig = require('./tsconfig.json')
const pkg = require('./package.json')

const translator = {
  source: 'The Brain.ts',
  target: `${tsconfig.compilerOptions.outDir}/The Brain.js`,
}
translator.mtime = fs.statSync(translator.source).mtime
translator.data = fs.readFileSync(translator.target, 'utf-8')

const header = {
  path: 'The Brain.json',
}
header.mtime = fs.statSync(header.path).mtime
if (header.mtime < translator.mtime) header.mtime = translator.mtime

header.data = require(`./${header.path}`)
header.data.lastUpdated = header.mtime.toISOString().replace('T', ' ').replace(/\..*/, '')
header.data = JSON.stringify(header.data, null, 2)

version = `// version: ${pkg.version}`

fs.writeFileSync(translator.target, [header.data, version, translator.data].join('\n\n'))
