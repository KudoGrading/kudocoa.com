#!/usr/bin/env node

import { exec } from 'child_process'
import open from 'open'

console.log('Building assets...')

exec('npm run build', (err, stdout, stderr) => {
    if (err) { console.error('Build failed:', err.message) ; process.exit(1) }
    if (stdout) console.log(stdout)
    if (stderr) console.error('Build warnings:', stderr)

    console.log('\n\x1b[1;92m✓ Build complete!\x1b[0m')
    console.log('\x1b[1;97mStarting dev server with debug mode...\x1b[0m')

    const wrangler = exec('npx wrangler dev --remote --ip localhost --port 8888')
    wrangler.stdout.on('data', data => {
        const output = data.toString() ; process.stdout.write(output)
        if (/Ready|http:\/\/localhost:8888/.test(output)) { // server ready
            console.log('\n\x1b[1;92m✓ Server ready! Opening browser with ?debug...\x1b[0m')
            setTimeout(() => open('http://localhost:8888?debug'), 500)
        }
    })
    wrangler.stderr.on('data', data => process.stderr.write(data.toString()))
})
