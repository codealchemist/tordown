import React, { Component } from 'react';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import AppBar from 'material-ui/AppBar';

import './App.css';
import AddComponent from './components/add'
import ListComponent from './components/list'
import tordown from './components/tordown'

export default class App extends Component {
  constructor () {
    super()
    this.state = {
      list: []
    }

    this.init()
  }

  init () {
    tordown
      .on('open', () => {
        console.log('Connected to TORDOWN server!')
      })
      .on('uuid', (message) => {
        console.log('Got UUID:', message)
      })
      .on('list', (message) => {
        this.updateList(message)
      })
      .connect()
  }

  updateList (list) {
    console.log('UPDATE LIST', list)
    this.setState({list})
  }

  add (url) {
    console.log('ADD', url)
    tordown.add(url)
  }

  onPaste (event) {
    const clipboard = event.clipboardData || window.clipboardData;
    const pasted = clipboard.getData('Text');
    // console.log('PASTED:', pasted);
    this.add(pasted)
  }

  render () {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <div onPaste={(event) => this.onPaste(event)}>
          <AppBar
            title="tordown"
            iconElementRight={<AddComponent onAdd={(url) => this.add(url)} />}
            className="app-bar"
          />

          <div className="main-container">
            <ListComponent list={this.state.list} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
