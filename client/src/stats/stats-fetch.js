import React, { Component } from 'react'
export default function statsFetch(Comp) {
  class StatsFetchContainer extends Component {
    componentDidMount() {
      fetch(`http://localhost:6300/stats`)
        .then(p => p.json())
        .then((patterns) => {
          this.setState({ patterns })
        })
        .catch(error => this.setState({ error }))
    }
    render() {
      return <Comp {...this.props} {...this.state} />
    }
  }
  return StatsFetchContainer
}