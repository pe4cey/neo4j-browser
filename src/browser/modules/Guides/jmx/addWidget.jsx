/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'preact'
import { connect } from 'preact-redux'

import { addWidget } from 'shared/modules/widgets/widgetsDuck'

export class AddWidget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      input: '',
      entries: []
    }
  }
  addEmptyEntry () {
    this.setState({entries: this.state.entries.concat([null])})
  }
  componentWillMount () {
    this.addEmptyEntry()
  }
  onChange (event) {
    this.setState({input: event.target.value})
  }
  render () {
    return (
      <div>
        {
          this.state.entries.map(_ =>
            (<span>
              <label>Query</label>
              <input onChange={this.onChange.bind(this)} type='text' />
              <button onClick={() => this.props.saveWidgetQuery(this.state.input)}>Save</button>
            </span>)
          )
        }
        <br />
        <button onClick={this.addEmptyEntry.bind(this)}>Add</button>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveWidgetQuery: (query) => {
      dispatch(addWidget(query))
    }
  }
}

export default connect(null, mapDispatchToProps)(AddWidget)
