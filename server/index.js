const tordown = require('./components/tordown')

const port = process.env.PORT || 5000
tordown.start({port}, () => {
  console.log(`TORDOWN listening on http://localhost:${port}`)
})
