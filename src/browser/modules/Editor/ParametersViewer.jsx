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
import { getParams, update } from 'shared/modules/params/paramsDuck'
import { parseParam } from 'shared/modules/commands/helpers/params'
import { shouldEditorPersistParamsToGlobalScope } from 'shared/modules/settings/settingsDuck'
import {
  ParametersViewerContainer,
  ParametersViewerEntry,
  ParametersViewerKey,
  ParametersViewerInput
} from './styled'
import { isObject } from 'services/utils'

const ParametersViewerValue = props => (
  <ParametersViewerInput
    value={props.value}
    onChange={v => props.addParam(v.target.value)}
  />
)

const ParametersViewer = props => {
  return props.parameters ? (
    <ParametersViewerContainer>
      {props.parameters.map(param => {
        const addParam = value => {
          props.parseParam(
            `${param.paramName}: ${value}`,
            res =>
              props.editorPersistParamsToGlobalScope
                ? props.update(res)
                : props.addParam(res),
            e =>
              props.editorPersistParamsToGlobalScope
                ? props.update({ [param.paramName]: value })
                : props.addParam(e)
          )
        }
        const value =
          param.value && isObject(param.value)
            ? JSON.stringify(param.value)
            : param.value
        return (
          <ParametersViewerEntry>
            <ParametersViewerKey>{param.paramName}</ParametersViewerKey>
            <ParametersViewerValue addParam={addParam} value={value} />
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
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      parameters: mappedParams,
      parseParam
    }
  } else {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps
    }
  }
}

const mapStateToProps = store => ({
  params: getParams(store),
  editorPersistParamsToGlobalScope: shouldEditorPersistParamsToGlobalScope(
    store
  )
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  update: param => dispatch(update(param))
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  ParametersViewer
)
