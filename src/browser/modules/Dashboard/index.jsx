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
import Widget from './Widget'
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: 17px;
  background-color: #fff;
`

const Dashboard = ({bus}) => {
  const query = (cb) => {
    if (bus) {
      bus.self(
        CYPHER_REQUEST,
        {
          query: 'MATCH (n) RETURN count(n)'
        },
        cb
      )
    }
  }
  const memoryUsage = (cb) => {
    if (bus) {
      bus.self(
        CYPHER_REQUEST,
        {
          query: `call dbms.queryJmx('java.lang:type=OperatingSystem') yield attributes
                  return attributes.FreePhysicalMemorySize.value as value`
        },
        cb
      )
    }
  }
  const cpuUsage = (cb) => {
    if (bus) {
      bus.self(
        CYPHER_REQUEST,
        {
          query: `call dbms.queryJmx('java.lang:type=OperatingSystem') yield attributes
                  return attributes.SystemCpuLoad.value as value`
        },
        cb
      )
    }
  }
  return (
    <StyledStream>
      <Widget type='line' fetchData={query} timeout={1000} />
      <Widget type='line' title='Memory Usage' fetchData={memoryUsage} timeout={1000} />
      <Widget type='line' title='CPU Usage' fetchData={cpuUsage} timeout={10000} />
    </StyledStream>
  )
}
export default withBus(Dashboard)
