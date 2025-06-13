import * as esbuild from 'esbuild'
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./development.json', 'utf-8'));

let ctx = await esbuild.context({
  entryPoints: ['./src/index.js'],
  define:{
    'process.env.CLIENT_ID': JSON.stringify(config.CLIENT_ID),
  },
  bundle: true,
  outfile: 'public/bundle.js'
})

let { host, port } = await ctx.serve({
  servedir: 'public'
})

console.log(`${host}:${port}`)

await ctx.watch();