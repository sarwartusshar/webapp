import prerender from './prerender'

// This is a wrapper to handle a single isomorphic render inside a child process

function startRender(context) {
  prerender(context).then((result) => {
    process.send(result, null, {}, () => {
      process.exit(0)
    })
  }).catch(() => {
    process.exit(1)
  })
}

process.on('message', startRender)
