import React, { Component } from 'react';
import CircularProgress from 'material-ui/CircularProgress';

export default class Loading extends Component {
  get () {
    let loading = null
    if (this.props.show) {
      loading = (
        <div className="loading">
          <CircularProgress />
        </div>
      )
    }

    return loading
  }

  render () {
    return this.get()
  }
}
