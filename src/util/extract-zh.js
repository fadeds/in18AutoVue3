import fs from 'fs'
import path from 'path'

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file)
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walk(filepath, filelist)
    } else if (/\.(vue|js|ts)$/.test(file)) {
      filelist.push(filepath)
    }
  })
  return filelist
}

function extractChinese(text) {
  const reg = /[\u4e00-\u9fa5]+/g
  return text.match(reg) || []
}

const files = walk('./src')
const zhSet = new Set()

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8')
  extractChinese(content).forEach((str) => zhSet.add(str))
})

// 读取已存在的 zh-source.json
let oldZhArr = []
const zhPath = './locales/zh-source.json'
const localesDir = path.dirname(zhPath)
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true })
}

if (fs.existsSync(zhPath)) {
  oldZhArr = JSON.parse(fs.readFileSync(zhPath, 'utf-8'))
}
const merged = Array.from(new Set([...oldZhArr, ...zhSet]))

fs.writeFileSync(zhPath, JSON.stringify(merged, null, 2))
console.log('已合并并写入中文文本到 locales/zh-source.json')
console.log('已提取中文文本到 locales/zh-source.json')
