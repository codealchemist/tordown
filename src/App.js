import React, { Component } from 'react';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import AppBar from 'material-ui/AppBar';

import './App.css';
import AddComponent from './components/add'
import ListComponent from './components/list'
import Loading from './components/loading'
import tordown from './components/tordown'

export default class App extends Component {
  constructor () {
    super()
    this.state = {
      list: [],
      loading: true
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
      .once('list', (message) => {
        this.setState({loading: false})
      })
      .connect()
  }

  updateList (list) {
    console.log('UPDATE LIST', list)
    this.setState({list})
  }

  add (url) {
    console.log('ADD', url)
    this.setState({loading: true})
    tordown.add(url, () => {
      this.setState({loading: false})
    })
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

          <Loading show={this.state.loading} />

          <div className="main-container">
            <ListComponent list={this.state.list} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
