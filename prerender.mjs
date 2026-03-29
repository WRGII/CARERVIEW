import pkg from 'jsdom'
const { JSDOM } = pkg
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, 'dist')

const ROUTES = [
  '/',
  '/why',
  '/about',
  '/pricing',
  '/caregiver-forum',
  '/privacy-policy',
  '/data-policy',
]

const template = readFileSync(join(DIST, 'index.html'), 'utf8')

const originalError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Could not parse CSS')) return
  originalError(...args)
}

async function prerender(route) {
  const url = `https://carerview.com${route}`

  const dom = new JSDOM(template, {
    url,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = () => ({
        matches: false,
        addListener: () => {},
        removeEventListener: () => {},
      })
    },
  })

  await new Promise(resolve => setTimeout(resolve, 3000))

  const html = dom.serialize()
  dom.window.close()

  const outDir = route === '/' ? DIST : join(DIST, ...route.split('/').filter(Boolean))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html, 'utf8')
  console.log(`Prerendered: ${route}`)
}

for (const route of ROUTES) {
  try {
    await prerender(route)
  } catch (err) {
    console.warn(`Prerender skipped for ${route}: ${err.message}`)
  }
}
console.log('Pre-rendering complete.')
