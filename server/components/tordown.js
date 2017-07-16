const WebTorrent = require('webtorrent')
const WebSocket = require('ws')
const uuid = require('uuid/v1')
const Store = require('jfs')

class Tordown {
  constructor () {
    this.client = new WebTorrent()
    this.db = new Store('torrents')
    this.restored = false
  }

  start (port, callback) {
    this.wss = new WebSocket.Server({
      perMessageDeflate: false,
      port
    }, () => {
      if (typeof callback !== 'function') return
      callback()
    })

    this.init()
  }

  sendUuid (ws) {
    const id = uuid()
    log(`NEW client: ID: ${id}`)
    this.send(ws, {type: 'uuid', data: id})
    return id
  }

  init () {
    this.wss.on('connection', (ws) => {
      const id = this.sendUuid(ws)

      ws.on('message', (data) => {
        const message = JSON.parse(data)
        if (!message.type) {
          console.error(`INVALID MESSAGE from ${id}:`, message)
          return
        }

        log(`MESSAGE from ${id}`, message)
        if (typeof this[message.type] === 'function') {
          this[message.type](ws, message)
        }
      })

      ws.on('close', (ws) => {
        log('client DISCONNECTED')
        this.broadcast(ws, {
          type: 'disconnect',
          message: 'cya'
        })
      })

      this.client.on('error', (error) => {
        this.send(ws, {type: 'error', data: error})
      })

      if (!this.restored) {
        this.restore(() => {
          this.sendList(ws)
          this.loop(ws)
        })
        return
      }

      this.sendList(ws)
      this.loop(ws)
    })
  }

  broadcast (ws, message) {
    const data = JSON.stringify(message)
    this.wss.clients.forEach((client) => {
      if (client === ws) return
      if (client.readyState !== WebSocket.OPEN) return
      client.send(data, (error) => {}) // eslint-disable-line
    })
  }

  restore (callback) {
    this.db.all((err, data) => {
      if (err) {
        console.error('UNABLE to restore torrents!')
        console.error(err)
        process.exit()
      }

      this.restored = true
      const ids = Object.keys(data)
      if (!ids.length) {
        console.log('No torrents to restore.')
        if (typeof callback === 'function') callback()
        return
      }

      ids.map((id) => {
        this.client.add(data[id].url)
      })
      if (typeof callback === 'function') callback()
      console.log(`Restored ${ids.length} torrents.`)
    })
  }

  sendList (ws) {
    if (!this.client.torrents.length) {
      this.send(ws, {
        type: 'list',
        data: null
      })
      return
    }

    // console.log(`Updating list, ${this.client.torrents.length} torrents added.`)
    const data = this.client.torrents.map((torrent) => {
      return {
        infoHash: torrent.infoHash,
        path: torrent.path,
        timeRemaining: torrent.timeRemaining,
        received: torrent.received,
        downloaded: torrent.downloaded,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        progress: torrent.progress,
        magnetURI: torrent.magnetURI,
        ratio: torrent.ratio,
        files: torrent.files.map((file) => {
          return {
            name: file.name,
            path: file.path,
            length: file.length,
            downloaded: file.downloaded,
            progress: file.progress
          }
        })
      }
    })
    this.send(ws, {
      type: 'list',
      data
    })
  }

  loop (ws) {
    setInterval(() => this.sendList(ws), 3000)
  }

  send (ws, message) {
    const data = JSON.stringify(message)
    if (ws.readyState !== WebSocket.OPEN) return
    ws.send(data, (error) => {}) // eslint-disable-line
  }

  add (ws, {url}) {
    log('ADD', url)
    this.client.add(url, (torrent) => {
      const data = {
        infoHash: torrent.infoHash,
        path: torrent.path,
        url
      }
      console.log('GOT TORRENT', data)

      const id = this.db.save(data)
      data.id = id
      this.send(ws, {type: 'added', data})
    })
  }

  remove (ws, {id, url}) {
    this.client.remove(url, (error) => {
      if (error) console.error('UNABLE to remove torrent.', error)

      this.db.delete(id)
      this.send(ws, {type: 'removed', data: {id, url}})
    })
  }

  list (ws) {
    this.send(ws, {
      type: 'list',
      data: this.client.torrents
    })
  }

  on (eventName, callback) {
    this.client.on(eventName, callback)
    return this
  }
}

function log () {
  console.log('TORDOWN:', ...arguments)
}

module.exports = new Tordown()
