#!/usr/bin/env node

import { exec } from 'node:child_process'
import open from 'open'

const config = { noBuild: process.argv.some(arg => /--(?:no-?build|nb)/.test(arg)) },
      colors = { bw: '\x1b[1;97m', bg: '\x1b[1;92m', nc: '\x1b[0m' }

if (config.noBuild) startWrangler()
else {
    console.log(`${colors.bw}Building assets...${colors.nc}`)
    exec('npm run build', (err, stdout, stderr) => {
        if (err) { console.error('Build failed:', err.message) ; process.exit(1) }
        if (stdout) console.log(stdout)
        if (stderr) console.error('Build warnings:', stderr)
        console.log(`\n${colors.bg}✓ Build complete!${colors.nc}`)
        startWrangler()
    })
}

function startWrangler() {
    console.log(`${colors.bw}Starting dev server w/ debug mode${ config.noBuild ? ' (no build)' : '' }...${colors.nc}`)
    const wrangler = exec('npx wrangler dev --remote --ip localhost --port 8888')
    wrangler.stdout.on('data', data => {
        const output = data.toString() ; process.stdout.write(output)
        if (/Ready|http:\/\/localhost:8888/.test(output)) { // server ready
            console.log(`\n${colors.bg}✓ Server ready! Opening browser in ?debug mode...${colors.nc}`)
            open('http://localhost:8888?debug')
        }
    })
    wrangler.stderr.on('data', data => process.stderr.write(data.toString()))
}
