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
import reducer, { UPDATE } from './settingsDuck'

describe('settings reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.cmdchar).toEqual(':')
  })

  test('rehydrates state with initial value', () => {
    let initialState = reducer(undefined, {type: ''})
    const firstKeyFromState = Object.keys(initialState)[0]

    expect(initialState[firstKeyFromState]).not.toBe(undefined)
    delete initialState[firstKeyFromState]
    expect(initialState[firstKeyFromState]).toBe(undefined)

    const otherState = reducer(initialState, {type: ''})
    expect(otherState[firstKeyFromState]).not.toBe(undefined)
  })

  test('handles UPDATE without initial state', () => {
    const action = {
      type: UPDATE,
      state: {
        greeting: 'hello'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.greeting).toEqual('hello')
  })

  test('handles UPDATE', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual({
      cmdchar: ':',
      greeting: 'woff',
      type: 'dog'
    })
  })
})
