import fs from 'fs'
import axios from 'axios'
import crypto from 'crypto'

const zhArr = JSON.parse(fs.readFileSync('./locales/zh-source.json', 'utf-8'))
const enPath = './locales/en.json'
let enObj = {}
if (fs.existsSync(enPath)) {
  enObj = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
}

// 腾讯云API密钥
const secretId = ''
const secretKey = ''
const endpoint = 'tmt.tencentcloudapi.com'
const region = 'ap-beijing' // 根据实际选择

async function translateText(text) {
  const service = 'tmt'
  const host = endpoint
  const action = 'TextTranslate'
  const version = '2018-03-21'
  const timestamp = Math.floor(Date.now() / 1000)
  const payload = {
    SourceText: text,
    Source: 'zh',
    Target: 'en',
    ProjectId: 0,
  }
  const payloadStr = JSON.stringify(payload)

  // 步骤1：拼接规范请求串
  const httpRequestMethod = 'POST'
  const canonicalUri = '/'
  const canonicalQueryString = ''
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`
  const signedHeaders = 'content-type;host'
  const hashedRequestPayload = crypto.createHash('sha256').update(payloadStr).digest('hex')
  const canonicalRequest = [
    httpRequestMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join('\n')

  // 步骤2：拼接待签名字符串
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
  const credentialScope = `${date}/${service}/tc3_request`
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  const stringToSign = [
    'TC3-HMAC-SHA256',
    `${timestamp}`,
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n')

  // 步骤3：计算签名
  function hmac(key, str) {
    return crypto.createHmac('sha256', key).update(str).digest()
  }
  const kDate = hmac(`TC3${secretKey}`, date)
  const kService = hmac(kDate, service)
  const kSigning = hmac(kService, 'tc3_request')
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  // 步骤4：拼接 Authorization
  const authorization = [
    `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ')

  // 步骤5：发送请求
  const headers = {
    Authorization: authorization,
    'Content-Type': 'application/json; charset=utf-8',
    Host: host,
    'X-TC-Action': action,
    'X-TC-Version': version,
    'X-TC-Timestamp': timestamp,
    'X-TC-Region': region,
  }

  try {
    const res = await axios.post(`https://${host}`, payload, { headers })
    return res.data.Response.TargetText
  } catch (e) {
    console.error('翻译失败:', e.response ? e.response.data : e)
    return text // 失败时返回原文
  }
}

;(async () => {
  for (const zh of zhArr) {
    if (!enObj[zh]) {
      enObj[zh] = await translateText(zh)
    }
  }
  fs.writeFileSync(enPath, JSON.stringify(enObj, null, 2))
  console.log('已生成/更新英文翻译 locales/en.json')
})()
