class Communication {
  constructor () {
    this.events = {}
    this.onceEvents = {}
  }

  connect (url) {
    this.ws = new WebSocket(`ws://${url}`)
    this.init()
    return this
  }

  init () {
    this.ws.onopen = () => {
      // log('socket open')
      if (!this.events['open']) return

      this.events['open'].map((callback) => {
        if (typeof callback !== 'function') return false
        return callback()
      })
    }

    this.ws.onclose = () => {
      // log('socket closed')
      if (!this.events['close']) return

      this.events['close'].map((callback) => {
        if (typeof callback !== 'function') return false
        return callback()
      })
    }

    this.ws.onmessage = (event) => {
      // log('got message', event)
      const {type, data} = JSON.parse(event.data)
      if (!this.events[type]) return false

      this.events[type].map((callback) => {
        if (typeof callback !== 'function') return false
        callback(data)

        if (this.isOnceEvent(type, callback)) {
          this.offOnce(type, callback)
        }
        return true
      })
    }

    this.ws.onerror = (event) => {
      log('ERROR:', event)
      if (!this.events['error']) return false

      this.events['error'].map((callback) => {
        if (typeof callback !== 'function') return false
        return callback(event)
      })
    }
  }

  isOnceEvent (eventName, callback) {
    if (!this.onceEvents[eventName]) return false
    return this.onceEvents[eventName]
      .filter(currentCallback => currentCallback === callback)
      .length
  }

  offOnce (eventName, callback) {
    this.off(eventName, callback)

    if (!this.onceEvents[eventName]) return false
    this.onceEvents[eventName] = this.onceEvents[eventName]
      .filter(currentCallback => currentCallback !== callback)
  }

  on (eventName, callback) {
    this.events[eventName] = this.events[eventName] || []
    this.events[eventName].push(callback)
    return this
  }

  once (eventName, callback) {
    this.onceEvents[eventName] = this.onceEvents[eventName] || []
    this.onceEvents[eventName].push(callback)
    this.on(eventName, callback)
    return this
  }

  off (eventName, callback) {
    if (!this.events[eventName]) return this

    this.events[eventName] = this.events[eventName]
      .filter(currentCallback => currentCallback !== callback)

    return this
  }

  send (message) {
    const data = JSON.stringify(message)
    this.ws.send(data)
    return this
  }
}

function log () {
  console.log('[ COMMUNICATION ]-->', ...arguments)
}

const communication = new Communication()
export default communication
