/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import { connect } from 'preact-redux'
import jsonic from 'jsonic'
import { getParams } from 'shared/modules/params/paramsDuck'

import {
  ParametersViewerContainer,
  ParametersViewerEntry,
  ParametersViewerKey,
  ParametersViewerTextInput
} from './styled'

const ParametersViewerValue = props => (
  <ParametersViewerTextInput
    value={props.value}
    onChange={v => props.addParam(v.target.value)}
  />
)

const ParametersViewer = props => {
  return props.parameters ? (
    <ParametersViewerContainer>
      {props.parameters.map(param => {
        const addParam = value => {
          try {
            const obj = `${param.paramName}: ${value}`
            const json = '{' + obj + '}'
            const res = jsonic(json)
            return props.addParam(res)
          } catch (e) {
            return props.addParam({ [param.paramName]: value })
          }
        }
        return (
          <ParametersViewerEntry>
            <ParametersViewerKey>{param.paramName}: </ParametersViewerKey>
            <ParametersViewerValue addParam={addParam} value={param.value} />
          </ParametersViewerEntry>
        )
      })}
    </ParametersViewerContainer>
  ) : null
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  if (
    ownProps.parametersFromEditor &&
    ownProps.parametersFromEditor.index &&
    ownProps.parametersFromEditor.index.names
  ) {
    const mappedParams = ownProps.parametersFromEditor.index.names.map(
      paramName => {
        return {
          paramName,
          value: stateProps.params[paramName]
        }
      }
    )
    return {
      parameters: mappedParams,
      ...ownProps
    }
  } else {
    return {
      ...stateProps
    }
  }
}

const mapStateToProps = store => ({
  params: getParams(store)
})

export default connect(mapStateToProps, null, mergeProps)(ParametersViewer)
