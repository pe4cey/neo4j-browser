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

import { connect } from 'preact-redux'
import { Component } from 'preact'
import { StyledStream } from './styled'

import CypherFrame from './CypherFrame/index'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import Frame from './Frame'
import HtmlFrame from './HtmlFrame'
import PreFrame from './PreFrame'
import ParamsFrame from './ParamsFrame'
import ErrorFrame from './ErrorFrame'
import HelpFrame from './HelpFrame'
import SchemaFrame from './SchemaFrame'
import SysInfoFrame from './SysInfoFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import ServerStatusFrame from './Auth/ServerStatusFrame'
import ChangePasswordFrame from './Auth/ChangePasswordFrame'
import QueriesFrame from './Queries/QueriesFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import { getFrames } from 'shared/modules/stream/streamDuck'
import { getRequests } from 'shared/modules/requests/requestsDuck'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import { getScrollToTop } from 'shared/modules/settings/settingsDuck'
import { deepEquals } from 'services/utils'

const getFrame = (type) => {
  const trans = {
    html: HtmlFrame,
    error: ErrorFrame,
    cypher: CypherFrame,
    'user-list': UserList,
    'user-add': UserAdd,
    'change-password': ChangePasswordFrame,
    pre: PreFrame,
    play: PlayFrame,
    'play-remote': PlayFrame,
    history: HistoryFrame,
    param: ParamsFrame,
    params: ParamsFrame,
    connection: ConnectionFrame,
    disconnect: DisconnectFrame,
    schema: SchemaFrame,
    help: HelpFrame,
    queries: QueriesFrame,
    sysinfo: SysInfoFrame,
    status: ServerStatusFrame,
    default: Frame
  }
  return trans[type] || trans['default']
}

class Stream extends Component {
  shouldComponentUpdate (props) {
    const frameHasBeenAdded = this.props.frames.length < props.frames.length
    if (frameHasBeenAdded && this.props.scrollToTop) {
      this.base.scrollTop = 0
      return true
    }
    return !deepEquals(props, this.props)
  }
  render () {
    return (
      <StyledStream>
        {this.props.frames.map((frame) => {
          const frameProps = {
            frame,
            activeConnectionData: this.props.activeConnectionData,
            request: this.props.requests[frame.requestId]
          }
          const MyFrame = getFrame(frame.type)
          return <MyFrame {...frameProps} key={frame.id} />
        })}
      </StyledStream>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    frames: getFrames(state),
    requests: getRequests(state),
    activeConnectionData: getActiveConnectionData(state),
    scrollToTop: getScrollToTop(state)
  }
}

export default connect(mapStateToProps)(Stream)
