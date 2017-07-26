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

/* global test, expect */
import uuid from 'uuid'
import reducer, * as widgets from './widgetsDuck'

describe('widgets reducer', () => {
  test('should update state for widgets when widget is removed and only one item is in the list', () => {
    const widget = { query: 'foobar' }
    const initialState = [widget]
    const action = {
      type: widgets.REMOVE_WIDGET,
      widget: [widget]
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual([])
  })

  test('should update state for widgets when widget is removed when there is more than one item in the list', () => {
    const widget1 = { id: uuid.v4(), query: 'a' }
    const widget2 = { id: uuid.v4(), query: 'b' }
    const widget3 = { id: uuid.v4(), query: 'c' }
    const initialState = [
      widget1,
      widget2,
      widget3
    ]
    const action = {
      type: widgets.REMOVE_WIDGET,
      id: widget2.id
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual([widget1, widget3])
  })
  test('should return widget by id', () => {
    const widget1 = { id: uuid.v4(), query: 'a' }
    const widget2 = { id: uuid.v4(), query: 'b' }
    const initialState = [
      widget1,
      widget2
    ]

    const nextState = reducer(initialState, {})
    expect(widgets.getWidget(nextState, widget1.id)).toEqual(widget1)
    expect(widgets.getWidget(nextState, widget2.id)).toEqual(widget2)
  })
  test.only('should update widget by id', () => {
    const widget1 = { id: uuid.v4(), query: 'a' }
    const widget2 = { id: uuid.v4(), query: 'b' }
    const initialState = [
      widget1,
      widget2
    ]
    const newContent = '//Foobar'
    const action = {
      type: widgets.UPDATE_WIDGET,
      id: widget1.id,
      query: newContent
    }
    const nextState = reducer(initialState, action)
    expect(widgets.getWidget(nextState, widget1.id)).toEqual({...widget1, query: newContent})
    expect(widgets.getWidget(nextState, widget2.id)).toEqual(widget2)
  })
})

describe('widget actions', () => {
  test('should handle loading widgets', () => {
    const widgets = [{}]
    const expected = {
      type: widgets.LOAD_WIDGETS,
      widgets
    }
    expect(widgets.loadWidgets(widgets)).toEqual(expected)
  })
  test('should handle removing widget', () => {
    const id = uuid.v4()
    const expected = {
      type: widgets.REMOVE_WIDGET,
      id
    }
    expect(widgets.removeWidget(id)).toEqual(expected)
  })
})
