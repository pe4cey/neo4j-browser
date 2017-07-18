import { withBus } from 'preact-suber'

import Widget from 'browser/modules/Dashboard/Widget'
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
    </table>
  )
}

export default withBus(dashboard)
