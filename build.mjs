import * as esbuild from 'esbuild'
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./production.json', 'utf-8'));

await esbuild.build({
  entryPoints: ['./src/index.js'],
  define:{
    'process.env.CLIENT_ID': JSON.stringify(config.CLIENT_ID),
  },
  bundle: true,
  minify: true,
  outfile: 'dist/bundle.js'
})
