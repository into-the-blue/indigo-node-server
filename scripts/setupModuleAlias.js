const fs = require('fs')
const path = require('path')
const packageJsonPth = path.join(__dirname, '..', 'package.json')

let file = fs.readFileSync(packageJsonPth, 'utf8')

file = file.replace('"./src"', '"./dist"')

fs.writeFileSync(packageJsonPth, file)
console.log('DONE')
