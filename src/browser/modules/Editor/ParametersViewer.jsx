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

import { Component } from 'preact'
import { connect } from 'preact-redux'
import { getParams } from 'shared/modules/params/paramsDuck'

import { ParametersViewerContainer, ParametersViewerEntry } from './styled'

class ParametersViewer extends Component {
  render () {
    return this.props.parameters ? (
      <ParametersViewerContainer>
        {this.props.parameters.map(param => (
          <ParametersViewerEntry>
            {param.paramName}:{' '}
            <input>{param.value ? param.value : '`Not set`'}</input>
          </ParametersViewerEntry>
        ))}
      </ParametersViewerContainer>
    ) : null
  }
}
const mergeProps = (stateProps, dispatchProps, ownProps) => {
  if (
    ownProps.parametersFromEditor &&
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
      parameters: mappedParams
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
