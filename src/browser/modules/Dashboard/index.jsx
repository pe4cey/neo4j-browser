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

import styled from 'styled-components'
import { Component } from 'preact'
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import Widget from './Widget'
import { getAllWidgets } from './AllWidgets'

const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: 17px;
  background-color: #fff;
  color: black;
`

export class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      res: []
    }
  }
  componentWillMount () {
    getAllWidgets(this.props.bus).then(res => this.setState({res}))
  }
  render () {
    return (
      <StyledStream>
        {this.state.res.map((value) => {
          return (<Widget type='line' title={value} fetchData={(cb) => {
            this.props.bus.self(
              CYPHER_REQUEST,
              {
                query: `call dbms.queryJmx('java.lang:type=OperatingSystem') yield attributes
                        return attributes.${value}.value as value`
              },
              cb
            )
          }} timeout={1000} dataPoints={10} />)
        })
      }
      </StyledStream>
    )
  }

}

export default withBus(Dashboard)
