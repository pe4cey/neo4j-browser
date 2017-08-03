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
import { getBrowserName, mergeListsById } from 'services/utils'
import { scripts as staticScriptsList } from './staticScripts'

export const NAME = 'documents'

export const ADD_FAVORITE = 'favorites/ADD_FAVORITE'
export const REMOVE_FAVORITE = 'favorites/REMOVE_FAVORITE'
export const LOAD_FAVORITES = 'favorites/LOAD_FAVORITES'
export const SYNC_FAVORITES = 'favorites/SYNC_FAVORITES'
export const UPDATE_FAVORITE = 'favorites/UPDATE_FAVORITE'
export const UPDATE_FAVORITES = 'favorites/UPDATE_FAVORITES'

export const getFavorites = (state) => state[NAME]
export const getFavorite = (state, id) => state.filter((favorite) => favorite.id === id)[0]
export const removeFavoriteById = (state, id) => state.filter((favorite) => favorite.id !== id)
const versionSize = 20

// reducer
const initialState = staticScriptsList.map(script => Object.assign({}, script, {isStatic: true}))

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case REMOVE_FAVORITE:
      return removeFavoriteById(state, action.id)
    case ADD_FAVORITE:
      return state.concat([{id: uuid.v4(), content: action.cmd}])
    case UPDATE_FAVORITE:
      const mergedFavorite = Object.assign({}, getFavorite(state, action.id), {content: action.cmd})
      const updatedFavorites = state.map((_) => _.id === action.id ? mergedFavorite : _)
      return mergeListsById(initialState, updatedFavorites)
    case LOAD_FAVORITES:
    case UPDATE_FAVORITES:
      return mergeListsById(initialState, action.favorites)
    case USER_CLEAR:
      return initialState
    case APP_START:
      return mergeListsById(initialState, state)
    default:
      return state
  }
}

export function removeFavorite (id) {
  return {
    type: REMOVE_FAVORITE,
    id
  }
}
export function addFavorite (cmd) {
  return {
    type: ADD_FAVORITE,
    cmd
  }
}
export function loadFavorites (favorites) {
  return {
    type: LOAD_FAVORITES,
    favorites
  }
}
export function syncFavorites (favorites) {
  return {
    type: SYNC_FAVORITES,
    favorites
  }
}
export function updateFavorite (id, cmd) {
  return {
    type: UPDATE_FAVORITE,
    id,
    cmd
  }
}
export function updateFavorites (favorites) {
  return {
    type: UPDATE_FAVORITES,
    favorites
  }
}

export const composeDocumentsToSync = (store, syncValue) => {
  const documents = syncValue.syncObj.documents
  const favorites = getFavorites(store.getState()).filter(fav => !fav.isStatic)

  let newDocuments = [{
    'client': getBrowserName(),
    'data': favorites,
    'syncedAt': Date.now()
  }].concat(documents.slice(0, versionSize))

  return newDocuments
}

export const favoritesToLoad = (action, store) => {
  let favoritesFromSync = (action.obj.syncObj && action.obj.syncObj.documents.length > 0)
    ? (action.obj.syncObj.documents[0].data || [])
    : null

  if (favoritesFromSync) {
    const existingFavs = getFavorites(store.getState())
    const allFavorites = mergeListsById(favoritesFromSync, existingFavs)

    if (existingFavs.every(exFav => exFav.isStatic || favoritesFromSync.findIndex(syncFav => syncFav.id === exFav.id) >= 0)) {
      return { favorites: allFavorites, syncFavorites: false, loadFavorites: true }
    } else {
      return { favorites: allFavorites, syncFavorites: true, loadFavorites: true }
    }
  } else {
    return { favorites: null, syncFavorites: false, loadFavorites: false }
  }
}
