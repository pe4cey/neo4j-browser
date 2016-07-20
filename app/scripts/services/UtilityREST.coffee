###!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

'use strict';

angular.module('neo4jApp.services')
  .factory 'UtilityREST', [
    'Server'
    'Settings'
    '$q'
    (Server, Settings, $q) ->
      {
        clearConnection: -> angular.noop
        getJmx: (whatToGet = []) ->
          Server.jmx(whatToGet)

        getVersion: (version) ->
          q = $q.defer()
          q.resolve Server.version(version)
          q.promise

        getStoredProceduresList: () ->
          q = $q.defer()
          Server.cypher('', {query: 'CALL dbms.procedures() YIELD name'}).then(
            (r) ->
              response = r.data.data.map((d) -> return d[0])
              q.resolve response
          )

        getSchema: (input) ->
          q = $q.defer()
          Server.console(input.substr(1))
          .then(
            (r) ->
              response = r.data[0]
              if response.match('Unknown')
                q.reject(error("Unknown action", null, response))
              else
                q.resolve(response)
          )
          q.promise

        getMeta: ->
          q = $q.defer()
          obj =
            labels: Server.labels()
            relationships: Server.relationships()
            propertyKeys: Server.propertyKeys()
          q.resolve obj
          q.promise

        makeRequest: (withoutCredentials) ->
          opts = if withoutCredentials then {skipAuthHeader: withoutCredentials} else {}
          p = Server.get("#{Settings.endpoint.rest}/", opts)
        setNewPassword: (username, newPasswd) ->
          Server.post("#{Settings.endpoint.authUser}/#{username}/password", {password: newPasswd})
      }
]
