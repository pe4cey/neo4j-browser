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

/* global describe, test, expect */
import driver from 'services/driver'
import {
  applyGraphTypes,
  recursivelyTypeGraphItems,
  reservedTypePropertyName
} from './boltMappings'

describe('applyGraphTypes', () => {
  test('should work with undefined', () => {
    const result = applyGraphTypes(nativeTypesToCustom())
    const expUndefined = applyGraphTypes(undefined)
    expect(result).toBeUndefined()
    expect(expUndefined).toBeUndefined()
  })

  test('should work with null', () => {
    const result = applyGraphTypes(nativeTypesToCustom(null))
    expect(result).toBeNull()
  })

  test('should work with number', () => {
    const result = applyGraphTypes(nativeTypesToCustom(12345))
    expect(result).toEqual(12345)
  })

  test('should work with negative number', () => {
    const result = applyGraphTypes(nativeTypesToCustom(-123))
    expect(result).toEqual(-123)
  })

  test('should work with float', () => {
    const result = applyGraphTypes(nativeTypesToCustom(123.45))
    expect(result).toEqual(123.45)
  })

  test('should work with negative float', () => {
    const result = applyGraphTypes(nativeTypesToCustom(-123.45))
    expect(result).toEqual(-123.45)
  })

  test('should work with boolean', () => {
    let x = nativeTypesToCustom(true)
    const result = applyGraphTypes(nativeTypesToCustom(true))
    const xResult = applyGraphTypes(x)
    expect(result).toEqual(true)
    expect(xResult).toEqual(x)
  })

  test('should work with string', () => {
    const result = applyGraphTypes(nativeTypesToCustom('some string'))
    expect(result).toEqual('some string')
  })

  test('should work with empty string', () => {
    const result = applyGraphTypes(nativeTypesToCustom(''))
    expect(result).toEqual('')
  })

  test('should work with empty object', () => {
    const input = nativeTypesToCustom({})
    const result = applyGraphTypes(input)
    expect(result).toEqual(input)
  })

  test('should work with custom object', () => {
    const input = nativeTypesToCustom({
      prop1: null,
      prop2: 33,
      prop3: 33.22,
      prop4: 'a string',
      prop5: true,
      prop6: { prop1: 1, prop2: 'test' },
      [reservedTypePropertyName]: 'Yihaa'
    })

    const result = applyGraphTypes(input)

    expect(result).toBeTruthy()
    expect(result.prop1).toBeNull()
    expect(result.prop2).toEqual(33)
    expect(result.prop3).toEqual(33.22)
    expect(result.prop4).toEqual('a string')
    expect(result.prop5).toEqual(true)
    expect(result.prop6.prop1).toEqual(1)
    expect(result.prop6.prop2).toEqual('test')
    expect(result[reservedTypePropertyName]).toEqual('Yihaa')
  })

  test('should work with empty array', () => {
    const input = nativeTypesToCustom([])
    const result = applyGraphTypes([])
    expect(result).toEqual(input)
  })

  test('should work with array', () => {
    const inputArray = nativeTypesToCustom(['str1', 'str2', 'srtr3'])
    const result = applyGraphTypes(inputArray)
    expect(Array.isArray(result)).toEqual(true)
    inputArray.forEach((item, index) => {
      expect(item).toEqual(result[index])
    })
  })

  test('should apply integer type', () => {
    const rawNumber = nativeTypesToCustom(driver.int(5))
    const typedNumber = applyGraphTypes(rawNumber)
    expect(typedNumber).toBeInstanceOf(driver.Integer)
  })

  test('should apply node type', () => {
    const node = new driver.types.Node(driver.int(5), ['Test'], {})
    const rawNode = nativeTypesToCustom(node)

    const typedNode = applyGraphTypes(rawNode)
    expect(typedNode).toBeInstanceOf(driver.types.Node)
    expect(typedNode.identity).toBeInstanceOf(driver.Integer)
  })

  test('should not false positive on fake node object type', () => {
    const rawObject = nativeTypesToCustom({
      labels: ['Test'],
      properties: {},
      identity: driver.int(5),
      identity2: { low: 5, high: 0, [reservedTypePropertyName]: 'Integer' },
      [reservedTypePropertyName]: 'Node'
    })

    const obj = applyGraphTypes(rawObject)
    expect(obj).toBeInstanceOf(Object)
    expect(obj.identity).toBeInstanceOf(driver.Integer)
    expect(obj.identity2).toBeInstanceOf(Object)
    expect(obj[reservedTypePropertyName]).toEqual('Node')
  })

  test('should apply node type with properties of type null, integer, string, object, array', () => {
    const properties = {
      prop1: null,
      prop2: 33,
      prop3: 33.22,
      prop4: 'a string',
      prop5: true,
      prop6: { prop1: 1, prop2: 'test' },
      prop7: { prop1: driver.int(3), prop2: 'test' },
      prop8: {
        prop1: driver.int(3),
        prop2: { str: 'Some string' }
      },
      prop9: {
        prop1: ['array str', 'me too'],
        prop2: [12, 32, 44],
        prop3: [{ p1: true, p2: 'tenant' }, { p1: null }]
      },
      prop10: undefined,
      prop11: { [reservedTypePropertyName]: 'Yolo' }
    }

    const origNode = new driver.types.Node(driver.int(5), ['Test'], properties)
    const rawNode = nativeTypesToCustom(origNode)

    const typedNode = applyGraphTypes(rawNode)
    expect(typedNode).toBeInstanceOf(driver.types.Node)
    expect(typedNode.identity).toBeInstanceOf(driver.Integer)

    expect(typedNode.properties.prop1).toBeNull()
    expect(typedNode.properties.prop2).toEqual(33)
    expect(typedNode.properties.prop3).toEqual(33.22)
    expect(typedNode.properties.prop4).toEqual('a string')
    expect(typedNode.properties.prop5).toEqual(true)

    expect(typedNode.properties.prop6.prop1).toEqual(1)
    expect(typedNode.properties.prop6.prop2).toEqual('test')

    expect(typedNode.properties.prop7.prop1).toBeInstanceOf(driver.Integer)
    expect(typedNode.properties.prop7.prop1.toInt()).toEqual(3)
    expect(typedNode.properties.prop7.prop2).toEqual('test')

    expect(typedNode.properties.prop8.prop2.str).toEqual('Some string')

    expect(Array.isArray(typedNode.properties.prop9.prop1)).toEqual(true)
    expect(typedNode.properties.prop9.prop1[0]).toEqual('array str')
    expect(typedNode.properties.prop9.prop3[0].p1).toEqual(true)
    expect(typedNode.properties.prop9.prop3[0].p2).toEqual('tenant')
    expect(typedNode.properties.prop9.prop3[1].p1).toEqual(null)

    expect(Array.isArray(typedNode.properties.prop9.prop2)).toEqual(true)
    expect(Array.isArray(typedNode.properties.prop9.prop3)).toEqual(true)

    expect(typedNode.properties.prop10).toBeUndefined()
    expect(typedNode.properties.prop11[reservedTypePropertyName]).toEqual(
      'Yolo'
    )
  })

  test('should apply node type to array of data', () => {
    const nodes = [
      new driver.types.Node(driver.int(5), ['Test'], {}),
      new driver.types.Node(driver.int(15), ['Test2'], {})
    ]

    const rawNodes = nativeTypesToCustom(nodes)

    const typedNodes = applyGraphTypes(rawNodes, driver.types)
    expect(typedNodes.length).toEqual(2)
    expect(typedNodes[0]).toBeInstanceOf(driver.types.Node)
    expect(typedNodes[0].identity).toBeInstanceOf(driver.Integer)
    expect(typedNodes[1]).toBeInstanceOf(driver.types.Node)
    expect(typedNodes[1].identity).toBeInstanceOf(driver.Integer)
  })

  test('should apply relationship type', () => {
    const rel = new driver.types.Relationship(
      driver.int(5),
      driver.int(1),
      driver.int(2),
      'TESTED_WITH',
      {}
    )

    const rawRelationship = nativeTypesToCustom(rel)

    const typedRelationship = applyGraphTypes(rawRelationship)
    expect(typedRelationship).toBeInstanceOf(driver.types.Relationship)
    expect(typedRelationship.identity).toBeInstanceOf(driver.Integer)
    expect(typedRelationship.type).toEqual('TESTED_WITH')
  })

  test('should apply relationship type to array of data', () => {
    const rels = [
      new driver.types.Relationship(
        driver.int(1),
        driver.int(5),
        driver.int(10),
        'TestType',
        {}
      ),
      new driver.types.Relationship(
        driver.int(2),
        driver.int(15),
        driver.int(20),
        'TestType_2',
        {}
      )
    ]

    const rawRelationships = nativeTypesToCustom(rels)

    const typedRelationships = applyGraphTypes(rawRelationships)
    expect(typedRelationships.length).toEqual(2)
    expect(typedRelationships[0]).toBeInstanceOf(driver.types.Relationship)
    expect(typedRelationships[0].identity).toBeInstanceOf(driver.Integer)
    expect(typedRelationships[0].start).toBeInstanceOf(driver.Integer)
    expect(typedRelationships[0].end).toBeInstanceOf(driver.Integer)
    expect(typedRelationships[1]).toBeInstanceOf(driver.types.Relationship)
    expect(typedRelationships[1].identity).toBeInstanceOf(driver.Integer)
    expect(typedRelationships[1].start).toBeInstanceOf(driver.Integer)
    expect(typedRelationships[1].end).toBeInstanceOf(driver.Integer)
  })

  test('should apply to custom object properties', () => {
    const num = driver.int(5)
    const node = new driver.types.Node(driver.int(5), ['Test'], {})
    const obj = { num, node }

    const rawData = nativeTypesToCustom(obj)

    const typedObject = applyGraphTypes(rawData)
    expect(typedObject.node).toBeInstanceOf(driver.types.Node)
    expect(typedObject.num).toBeInstanceOf(driver.Integer)
  })

  test('should apply to array of custom object properties', () => {
    const rawNumber1 = driver.int(5)
    const rawNode1 = new driver.types.Node(driver.int(5), ['Test-1'], {})

    const rawNumber2 = driver.int(10)
    const rawNode2 = new driver.types.Node(driver.int(10), ['Test-2'], {})

    const rawObj = nativeTypesToCustom([
      { num: rawNumber1, node: rawNode1 },
      { num: rawNumber2, node: rawNode2 }
    ])

    const typedObjects = applyGraphTypes(rawObj)
    expect(typedObjects.length).toEqual(2)
    expect(typedObjects[0].node).toBeInstanceOf(driver.types.Node)
    expect(typedObjects[0].num).toBeInstanceOf(driver.Integer)
    expect(typedObjects[1].node).toBeInstanceOf(driver.types.Node)
    expect(typedObjects[1].num).toBeInstanceOf(driver.Integer)
  })

  test('should apply PathSegment type', () => {
    const segment = nativeTypesToCustom(getAPathSegment(5, 10, 1))
    const typedPathSegment = applyGraphTypes(segment)
    expect(typedPathSegment).toBeTruthy()
    expect(typedPathSegment).toBeInstanceOf(driver.types.PathSegment)
    expect(typedPathSegment.start).toBeInstanceOf(driver.types.Node)
    expect(typedPathSegment.start.identity).toBeInstanceOf(driver.Integer)
    expect(typedPathSegment.end).toBeInstanceOf(driver.types.Node)
    expect(typedPathSegment.relationship).toBeInstanceOf(
      driver.types.Relationship
    )
  })

  test('should apply to array of PathSegment type', () => {
    const segment1 = nativeTypesToCustom(getAPathSegment(5, 1, 10))
    const segment2 = nativeTypesToCustom(getAPathSegment(15, 2, 20))

    const typedPathSegments = applyGraphTypes([segment1, segment2])
    expect(typedPathSegments.length).toEqual(2)

    expect(typedPathSegments[0]).toBeInstanceOf(driver.types.PathSegment)
    expect(typedPathSegments[0].start).toBeInstanceOf(driver.types.Node)
    expect(typedPathSegments[0].end).toBeInstanceOf(driver.types.Node)
    expect(typedPathSegments[0].relationship).toBeInstanceOf(
      driver.types.Relationship
    )

    expect(typedPathSegments[1]).toBeInstanceOf(driver.types.PathSegment)
    expect(typedPathSegments[1].start).toBeInstanceOf(driver.types.Node)
    expect(typedPathSegments[1].end).toBeInstanceOf(driver.types.Node)
    expect(typedPathSegments[1].relationship).toBeInstanceOf(
      driver.types.Relationship
    )
  })

  test('should apply Path type', () => {
    const rawPAth = nativeTypesToCustom(
      getAPath([
        { start: 5, end: 10, relationship: 1 },
        {
          start: 10,
          end: 15,
          relationship: 2
        }
      ])
    )
    const typedPath = applyGraphTypes(rawPAth)
    expect(typedPath).toBeTruthy()
    expect(typedPath).toBeInstanceOf(driver.types.Path)
    expect(typedPath.start).toBeInstanceOf(driver.types.Node)
    expect(typedPath.end).toBeInstanceOf(driver.types.Node)

    expect(typedPath.segments.length).toEqual(2)
    expect(typedPath.segments[0]).toBeInstanceOf(driver.types.PathSegment)
    expect(typedPath.segments[1]).toBeInstanceOf(driver.types.PathSegment)
  })

  test('should apply to a complex object of graph types', () => {
    const rawNode = new driver.types.Node(driver.int(5), ['Test'], {})
    const rawNum = driver.int(100)
    const rawPath = getAPath([
      { start: 5, end: 10, relationship: 1 },
      { start: 10, end: 15, relationship: 2 }
    ])
    const rawRelationship = new driver.types.Relationship(
      driver.int(1),
      driver.int(5),
      driver.int(10),
      'TestType',
      {}
    )
    const complexObj = nativeTypesToCustom({
      rawNum,
      rawNode,
      rawRelationship,
      rawPath
    })
    const typedObject = applyGraphTypes(complexObj)
    expect(typedObject).toBeTruthy()
    expect(typedObject.rawNum).toBeInstanceOf(driver.Integer)
    expect(typedObject.rawNode).toBeInstanceOf(driver.types.Node)
    expect(typedObject.rawRelationship).toBeInstanceOf(
      driver.types.Relationship
    )
    expect(typedObject.rawPath).toBeInstanceOf(driver.types.Path)
    expect(typedObject.rawPath.segments.length).toEqual(2)
    expect(typedObject.rawPath.segments[0]).toBeInstanceOf(
      driver.types.PathSegment
    )
    expect(typedObject.rawPath.segments[1]).toBeInstanceOf(
      driver.types.PathSegment
    )
  })
})

const nativeTypesToCustom = x => {
  if (Array.isArray(x)) {
    return typeHintArray(x)
  }
  if (x === undefined) return
  return typeHintArray([x])[0]
}

const typeHintArray = x =>
  x
    .map(x => recursivelyTypeGraphItems(x, driver.types))
    .map(JSON.stringify)
    .map(JSON.parse)

const getAPathSegment = (startId, relId, endId) => {
  const start = new driver.types.Node(driver.int(startId), ['From'], {})
  const end = new driver.types.Node(driver.int(endId), ['To'], {})
  const rel = new driver.types.Relationship(
    driver.int(relId),
    driver.int(startId),
    driver.int(endId),
    'TestType',
    {}
  )
  return new driver.types.PathSegment(start, rel, end)
}

const getAPath = segmentList => {
  const segments = segmentList.map(segment =>
    getAPathSegment(segment.start, segment.relationship, segment.end)
  )
  return new driver.types.Path(
    segments[0].start,
    segments[segments.length - 1].end,
    segments
  )
}
