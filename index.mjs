import * as esbuild from 'esbuild';

/**
 * @type {esbuild.Plugin}
 */
const zhuobuPlugin = {
    name: 'zhuobu',
    setup(build) {
      build.onLoad({ filter: /(react-dom\/client)|(tw-to-css)|(fs)|(path)|(prettier)/ }, async (args) => ({
        contents: ``,
      }))
  
    },
  }
const config = {
    entryPoints: ['src/main.ts', 'src/worker/main.ts'],
    bundle: true,
    outdir: 'dist',
    target: 'es2015',
    external: ['react-dom', 'fs', 'path'],
    logLevel: 'info',
    sourcemap: true,
    metafile: true,
    plugins: [zhuobuPlugin],
}


const ctx = await esbuild.context(config)
ctx.serve({
  servedir: '.',
})
await ctx.watch();