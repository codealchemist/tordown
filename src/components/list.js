import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import {List, ListItem} from 'material-ui/List';
import MovieIcon from 'material-ui/svg-icons/maps/local-movies';

export default class ListComponent extends Component {
  getList () {
    let list = (
      <div className="empty-list">EMPTY.</div>
    )

    console.log('LIST PROPS', this.props.list)
    if (this.props.list && this.props.list.length) {
      const items = this.props.list.map((item) => {
        let file = item.files[0]
        if (!file) {
          file = {
            name: '[ Getting metadata ]',
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

      list = (
        <div>
          <TextField
            hintText="Type what you're looking for"
            floatingLabelText="Filter downloads"
            fullWidth={true}
          />

          <List>
            {items}
          </List>
        </div>
      )
    }

    return list;
  }

  render () {
    return this.getList()
  }
}
