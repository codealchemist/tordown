import React, { Component } from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AddIcon from 'material-ui/svg-icons/content/add-circle';
import TextField from 'material-ui/TextField';

export default class AddComponent extends Component {
  state = {
    open: false,
    url: ''
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  add () {
    // console.log('ADD', this.state.url)
    this.props.onAdd(this.state.url)
    this.handleClose()
  }

  render () {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Add"
        primary={true}
        keyboardFocused={false}
        onTouchTap={() => this.add()}
      />,
    ]

    return (
      <div>
        <AddIcon className="nav-icon" onClick={() => this.handleOpen()} />
        <Dialog
          title="Add download"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <TextField
            hintText="maget://... or http://...file.torrent"
            floatingLabelText="Paste torrent or maget URL"
            fullWidth={true}
            onChange={(event, url) => {this.setState({url})}}
            autoFocus
          />
        </Dialog>
      </div>
    )
  }
}
