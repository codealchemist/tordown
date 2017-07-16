import React, { Component } from 'react'
import magnetParser from 'magnet-uri'

import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List'
import MovieIcon from 'material-ui/svg-icons/maps/local-movies'

export default class ListComponent extends Component {
  getItems() {
    console.log('LIST PROPS', this.props.list)
    if (!this.props.list || !this.props.list.length) return []

    const items = this.props.list.map((item) => {
      let file = item.files[0]
      const magnet = magnetParser(item.magnetURI || '')
      if (!file) {
        file = {
          name: magnet.dn || '[ Getting metadata ]',
          progress: 0
        }
      }

      const progress = Math.round(file.progress * 100)
      const name = `${file.name}`
      const key = item.infoHash
      return (
        <ListItem primaryText={name} leftIcon={<MovieIcon />} key={key}>
          <i className="torrent-progress">{progress}%</i>
        </ListItem>
      )
    })

    return items
  }

  getList () {
    // Empty list.
    let list = (
      <div className="empty-list">EMPTY.</div>
    )

    // List with items.
    const items = this.getItems()
    if (items.length) {
      list = (
        <div>
          <TextField
            hintText="Type what you're looking for"
            floatingLabelText="Filter downloads"
            fullWidth={true}
            onChange={(event, value) => this.filter(value)}
          />

          <List>
            {items}
          </List>
        </div>
      )
    }

    return list
  }

  filter (value) {
    console.log('FILTER:', value)
  }

  render () {
    return this.getList()
  }
}
