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

import { withBus } from 'preact-suber'

import Widget from 'browser/modules/Dashboard/Widget'
import SingleNumberWidget from 'browser/modules/Dashboard/SingleNumberWidget'
import SingleNumberGauge from 'browser/modules/Dashboard/SingleNumberGauge'
// import PreChartWidget from 'browser/modules/Dashboard/PreChartWidget'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

const dashboard = (props) => {
  const values = ['ProcessCpuLoad', 'SystemCpuLoad']
  const widgets = values.map(value => {
    return (<Widget type='line' title={value} fetchData={(cb) => {
      props.bus.self(
        CYPHER_REQUEST,
        {
          query: `call dbms.queryJmx('java.lang:type=OperatingSystem') yield attributes
                  return attributes.${value}.value as value`
        },
        cb
      )
    }} timeout={1000} dataPoints={10} mapper={(res) => {
      const value = res.result.records[0].get(res.result.records[0].keys[0])
      const returnVal = (value.toNumber) ? value.toNumber() : window.parseFloat(value) || 0
      return (returnVal * 1000) / 10.0
    }}
      yDomain={[0, 100]}
      width={500}
      height={400}
      margins={{left: 50, right: 50, top: 10, bottom: 50}}
    />)
  })
  return (
    <table>
      <tr>
        {
          widgets.map(w => <td>{w}</td>)
        }
      </tr>
      <tr>
        <SingleNumberWidget value='Number of users signed up' query='MATCH (n) RETURN count(n) as value' />
        <SingleNumberGauge value='CPU %' query={
          `call dbms.queryJmx('java.lang:type=OperatingSystem') yield attributes
           return attributes.ProcessCpuLoad.value * 1000 as value`
        } />
      </tr>
    </table>
  )
}

export default withBus(dashboard)
