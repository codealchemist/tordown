const WebTorrent = require('webtorrent')
const WebSocket = require('ws')
const uuid = require('uuid/v1')
const Store = require("jfs")

class Tordown {
  constructor () {
    this.client = new WebTorrent()
    this.db = new Store('torrents')
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
        const message = JSON.stringify({
          type: 'disconnect',
          message: 'cya'
        })
      })

      this.client.on('error', (error) => {
        this.send(ws, {type: 'error', data: error})
      })

      this.restore()
      this.sendList(ws)
      this.loop(ws)
    })
  }

  restore () {
    this.db.all((err, data) => {
      const ids = Object.keys(data)
      if (!ids.length) {
        console.log('No torrents to restore.')
        return
      }

      ids.map((id) => {
        this.client.add(data[id].url)
      })
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

  getGlobalStatus () {
    const status = {
      download: this.client.downloadSpeed,
      upload: this.client.uploadSpeed,
      progress: this.client.progress
    }

    this.send(ws, {
      type: 'globalStatus',
      data: status
    })
  }

  on (eventName, callback) {
    this.client.on(eventName, callback);
    return this
  }
}

function log () {
  const ts = (new Date()).toISOString()
  console.log('TORDOWN:', ...arguments)
}

module.exports = new Tordown()
