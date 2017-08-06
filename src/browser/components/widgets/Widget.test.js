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

/* global describe, test, expect, jest */
import { Widget } from './Widget'
import { mount } from 'services/testUtils'

describe('Widget', () => {
  test('should render widget', () => {
    const fetchData = jest.fn()
    const result = mount(Widget)
      .withProps({fetchData})
      .then((wrapper) => {
        expect(wrapper.html()).toContain('<svg')
      })
    return result
  })
  test('should call fetchData on componentWillMount', () => {
    const fetchData = jest.fn()
    const result = mount(Widget)
      .withProps({fetchData})
      .then((wrapper) => {
        wrapper.instance().componentWillMount()
        expect(fetchData).toHaveBeenCalledTimes(1)
      })
    return result
  })
  test('should periodically call fetchData 10 times', () => {
    jest.useFakeTimers()
    const fetchData = jest.fn()
    const timeoutInMs = 100
    const runCount = 10
    const result = mount(Widget)
      .withProps({fetchData, timeout: timeoutInMs})
      .then((wrapper) => {
        wrapper.instance().componentWillMount()
        jest.runTimersToTime(timeoutInMs * (runCount))

        expect(fetchData).toHaveBeenCalledTimes(runCount + 1)
      })
    return result
  })
  test('should only store 10 data points', () => {
    jest.useFakeTimers()
    const fetchData = jest.fn()
    const timeoutInMs = 100
    const fakeRes = {
      success: true,
      result: {
        records: [{
          get: () => {
            return 0
          },
          keys: ['a']
        }]
      }
    }
    const dataPoints = 10
    const mapper = () => '123'
    const result = mount(Widget)
      .withProps({fetchData, timeout: timeoutInMs, dataPoints, mapper})
      .then((wrapper) => {
        wrapper.setState({count: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]})
        wrapper.instance().responseHandler(fakeRes)
        expect(wrapper.state().data.length).toBe(dataPoints)
      })
    return result
  })
})
