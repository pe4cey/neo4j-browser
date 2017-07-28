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
import { mergeListsById } from 'services/utils'

export const NAME = 'widgets'

export const ADD_WIDGET = 'widgets/ADD_WIDGET'
export const REMOVE_WIDGET = 'widgets/REMOVE_WIDGET'
export const LOAD_WIDGETS = 'widgets/LOAD_WIDGETS'
export const UPDATE_WIDGET = 'widgets/UPDATE_WIDGET'
export const UPDATE_WIDGETS = 'widgets/UPDATE_WIDGETS'

export const getWidgets = (state) => state[NAME]
export const getWidget = (state, id) => state.filter((favorite) => favorite.id === id)[0]
export const removeWidgetById = (state, id) => state.filter((favorite) => favorite.id !== id)

// reducer
const initialState = []

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case REMOVE_WIDGET:
      return removeWidgetById(state, action.id)
    case ADD_WIDGET:
      return state.concat([{id: uuid.v4(), query: action.query}])
    case UPDATE_WIDGET:
      const mergedWidget = Object.assign({}, getWidget(state, action.id), {query: action.query})
      const updatedWidgets = state.map((_) => _.id === action.id ? mergedWidget : _)
      return mergeListsById(initialState, updatedWidgets)
    case LOAD_WIDGETS:
    case UPDATE_WIDGETS:
      return mergeListsById(initialState, action.favorites)
    case USER_CLEAR:
      return initialState
    case APP_START:
      return mergeListsById(initialState, state)
    default:
      return state
  }
}

export function removeWidget (id) {
  return {
    type: REMOVE_WIDGET,
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
    type: LOAD_WIDGETS,
    favorites
  }
}
export function updateWidget (id, cmd) {
  return {
    type: UPDATE_WIDGET,
    id,
    cmd
  }
}
export function updateWidgets (favorites) {
  return {
    type: UPDATE_WIDGETS,
    favorites
  }
}
