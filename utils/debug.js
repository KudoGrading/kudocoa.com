#!/usr/bin/env node

// Starts dev server in ?debug mode
// NOTE: Pass --<no-build|nb> to skip build JS/CSS

import { spawn } from 'node:child_process'
import open from 'open'

const { default: { env: { dev }}} = await import('../app.config.mjs'),
      config = { noBuild: process.argv.some(arg => /--(?:no-?build|nb)/.test(arg))},
      colors = { bw: '\x1b[1;97m', bg: '\x1b[1;92m', nc: '\x1b[0m' }

if (config.noBuild) startWrangler()
else {
    console.log(`${colors.bw}Building assets...${colors.nc}`)
    const buildProcess = spawn('npm.cmd', ['run', 'build'], { shell: true })
    buildProcess.stdout.on('data', data => process.stdout.write(data))
    buildProcess.stderr.on('data', data => process.stderr.write(data))
    buildProcess.on('close', code => {
        if (code == 0) {
            console.log(`\n${colors.bg}✓ Build complete!${colors.nc}`)
            startWrangler()
        } else {
            console.error('Build failed with exit code:', code)
            process.exit(1)
        }
    })
}

function startWrangler() {
    console.log(`${colors.bw}Starting dev server in ?debug mode${ config.noBuild ? ' (no build)' : '' }...${colors.nc}`)
    const wrangler = spawn('npx.cmd', ['wrangler', 'dev', '--ip', dev.ip, '--port', dev.port], { shell: true })
    wrangler.stdout.on('data', data => {
        process.stdout.write(data)
        if (new RegExp(`Ready|http://${dev.ip}:${dev.port}`).test(data)) { // server ready
            console.log(`\n${colors.bg}✓ Server ready! Opening browser in ?debug mode...${colors.nc}`)
            open(`http://${dev.ip}:${dev.port}?debug`)
        }
    })
    wrangler.stderr.on('data', data => process.stderr.write(data))
}
