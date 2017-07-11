import communication from './communication'

class Tordown {
  constructor () {
    this.ip = process.env.REACT_APP_IP
    console.log('CLIENT IP:', this.ip)
  }

  connect () {
    communication.connect(`${this.ip}:5000`)
    return this
  }

  on (eventName, callback) {
    communication.on(eventName, callback)
    return this
  }

  once (eventName, callback) {
    communication.once(eventName, callback)
    return this
  }

  add (url, callback) {
    communication
      .send({type: 'add', url})
      .once('added', (message) => {
        console.log('ADDED!', message)
        if (message.url === url) {
          if (typeof callback === 'function') callback(message)
        }
      })
    return this
  }
}

export default new Tordown()
