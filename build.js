const fs = require('fs')

const header = require('./The Brain.json')
header.lastUpdated = (new Date()).toISOString().replace('T', ' ').replace(/\..*/, '')

const translator = fs.readFileSync('The Brain.js', 'utf-8')

fs.writeFileSync('The Brain.js', JSON.stringify(header, null, 2) + '\n\n' + translator)
