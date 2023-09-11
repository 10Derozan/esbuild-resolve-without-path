const esbuild = require('esbuild');

const contents = `
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
`;

async function build_path() {
  await esbuild.build({
    entryPoints: ['./index.js'],
    bundle: true,
    outfile: 'dist/resolve-with-path.js',
    plugins: [{
      name: 'plugin',
      setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
          const id = require.resolve(args.path, args.resolveDir || __dirname);
          return {
            path: id,
            sideEffects: false,
          }
        });
        build.onLoad({ filter: /.*/ }, args => {
          if (/\.css/.test(args.path)) {
            return {
              contents,
              loader: 'js'
            }
          }
        })
      }
    }]
  });
}

async function build_without_path() {
  await esbuild.build({
    entryPoints: ['./index.js'],
    bundle: true,
    outfile: 'dist/resolve-without-path.js',
    plugins: [{
      name: 'plugin',
      setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
          return {
            sideEffects: false,
          }
        });
        build.onLoad({ filter: /.*/ }, args => {
          if (/\.css/.test(args.path)) {
            return {
              contents,
              loader: 'js'
            }
          }
        })
      }
    }]
  });
}

async function main() {
  await build_path();
  await build_without_path();
}

main();