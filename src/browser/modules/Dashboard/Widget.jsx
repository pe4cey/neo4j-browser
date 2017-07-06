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
import { withBus } from 'preact-suber'
import { LineChart } from 'react-d3-basic'

export class Widget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      count: []
    }
    this.tick = 0
  }
  componentWillMount () {
    const fn = () => {
      return (this.props.fetchData) ? this.props.fetchData(this.responseHandler.bind(this)) : () => {}
    }
    fn()
    setInterval(fn, this.props.timeout || 2000)
  }

  mapper (res) {
    const value = res.result.records[0].get(res.result.records[0].keys[0])
    return (value.toNumber) ? value.toNumber() : window.parseFloat(value) || 0
  }

  responseHandler (res) {
    if (!res.success) return
    const intValue = this.mapper(res)
    const arrayIndex = this.state.count.length + 1
    const point = arrayIndex - this.props.dataPoints
    const start = (point < 0) ? 0 : point
    const count = this.state.count.concat([{count: intValue, index: ++this.tick}]).slice(start, arrayIndex)
    this.setState({count})
  }
  render () {
    const margins = {left: 50, right: 50, top: 50, bottom: 50}
    const chartSeries = [
      {
        field: 'count',
        name: this.props.title,
        color: '#ff7f0e'
      }
    ]

    const x = (d) => d.index

    return (
      <LineChart
        margins={margins}
        title={this.props.title || ''}
        data={this.state.count}
        width={300}
        height={300}
        chartSeries={chartSeries}
        x={x}
      />
    )
  }
}
export default withBus(Widget)
