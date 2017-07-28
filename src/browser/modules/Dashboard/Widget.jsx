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
import { StyledWidgetContainer } from './styled'
import {
  ComposedChart,
  Area,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  YAxis
} from 'precharts'

export class Widget extends Component {
  constructor (props) {
    super(props)
    this.startData = {count: 0, index: 0}
    this.state = {
      data: new Array(10).fill({...this.startData})
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

  responseHandler (res) {
    if (!res.success) return
    const intValue = this.props.mapper(res)
    const arrayIndex = this.state.data.length + 1
    const point = arrayIndex - this.props.dataPoints
    const start = (point < 0) ? 0 : point
    const data = this.state.data.concat([{count: intValue, index: ++this.tick}]).slice(start, arrayIndex)
    this.setState({data})
  }
  render () {
    switch (this.props.type) {
      case 'GAUGE':
        const used = (this.state.data[this.state.data.length - 1]) ? this.state.data[this.state.data.length - 1].count : 0
        const data = [{name: 'used', value: used}, {name: 'available', value: 100 - used}]

        return (
          <PieChart width={800} height={400}>
            <Pie isAnimationActive={this.props.isStaticData || false} data={data} startAngle={180} endAngle={0} cx={200} cy={200} outerRadius={80} fill='#8884d8' label>
              {
              data.map((entry, index) => {
                return (entry.name === 'used') ? <Cell fill='#8884d8' /> : <Cell fill='transparent' />
              })
            }
            </Pie>
          </PieChart>
        )
      default:
        return (
          <StyledWidgetContainer>
            <h4>{this.props.title}</h4>
            <ComposedChart width={500} height={200} data={this.state.data}>
              <CartesianGrid strokeDasharray='3 3' />
              <Area isAnimationActive={this.props.isStaticData || false} dataKey='count' fill='green' opacity={0.3} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
            </ComposedChart>
          </StyledWidgetContainer>
        )
    }
  }
}
export default withBus(Widget)
