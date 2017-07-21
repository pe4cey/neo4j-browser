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

import uuid from 'uuid'
import { USER_CLEAR, APP_START } from 'shared/modules/app/appDuck'
import { getBrowserName } from 'services/utils'
// import { scripts as staticScriptsList } from './staticScripts'

export const NAME = 'widgets'

export const ADD_WIDGET = 'widgets/ADD_WIDGET'
export const REMOVE_WIDGET = 'widgets/REMOVE_WIDGET'
export const LOAD_WIDGETS = 'widgets/LOAD_WIDGETS'
export const SYNC_WIDGETS = 'widgets/SYNC_WIDGETS'
export const UPDATE_WIDGET = 'widgets/UPDATE_WIDGET'
export const UPDATE_WIDGETS = 'widgets/UPDATE_WIDGETS'

export const getWidgets = (state) => state[NAME]
export const getWidget = (state, id) => state.filter((favorite) => favorite.id === id)[0]
export const removeWidgetById = (state, id) => state.filter((favorite) => favorite.id !== id)
const versionSize = 20

// reducer
// const initialState = Object.assign({}, script))

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case REMOVE_WIDG:
      return removeWidgetById(state, action.id)
    case ADD_WIDGET:
      return state.concat([{id: uuid.v4(), content: action.cmd}])
    case UPDATE_WIDG:
      const mergedWidget = Object.assign({}, getWidget(state, action.id), {content: action.cmd})
      const updatedWidgets = state.map((_) => _.id === action.id ? mergedWidget : _)
      return mergeWidgets(initialState, updatedWidgets)
    case LOAD_WIDGS:
    case UPDATE_WIDGS:
      return mergeWidgets(initialState, action.favorites)
    case USER_CLEAR:
      return initialState
    case APP_START:
      return mergeWidgets(initialState, state)
    default:
      return state
  }
}

export function removeWidget (id) {
  return {
    type: REMOVE_WIDG,
    id
  }
}
export function addWidget (query) {
  return {
    type: ADD_WIDGET,
    query
  }
}
export function loadWidgets (favorites) {
  return {
    type: LOAD_WIDGS,
    favorites
  }
}
export function syncWidgets (favorites) {
  return {
    type: SYNC_WIDGS,
    favorites
  }
}
export function updateWidget (id, cmd) {
  return {
    type: UPDATE_WIDG,
    id,
    cmd
  }
}
export function updateWidgets (favorites) {
  return {
    type: UPDATE_WIDGS,
    favorites
  }
}

export const composeDocumentsToSync = (store, syncValue) => {
  const documents = syncValue.syncObj.documents
  const favorites = getWidgets(store.getState()).filter(fav => !fav.isStatic)

  let newDocuments = [{
    'client': getBrowserName(),
    'data': favorites,
    'syncedAt': Date.now()
  }].concat(documents.slice(0, versionSize))

  return newDocuments
}

export const mergeWidgets = (list1, list2) => {
  return list1.concat(list2.filter(favInList2 => list1.findIndex(favInList1 => favInList1.id === favInList2.id) < 0))
}

export const favoritesToLoad = (action, store) => {
  let favoritesFromSync = (action.obj.syncObj && action.obj.syncObj.documents.length > 0)
    ? (action.obj.syncObj.documents[0].data || [])
    : null

  if (favoritesFromSync) {
    const existingFavs = getWidgets(store.getState())
    const allWidgets = mergeWidgets(favoritesFromSync, existingFavs)

    if (existingFavs.every(exFav => exFav.isStatic || favoritesFromSync.findIndex(syncFav => syncFav.id === exFav.id) >= 0)) {
      return { favorites: allWidgets, syncWidgets: false, loadWidgets: true }
    } else {
      return { favorites: allWidgets, syncWidgets: true, loadWidgets: true }
    }
  } else {
    return { favorites: null, syncWidgets: false, loadWidgets: false }
  }
}
