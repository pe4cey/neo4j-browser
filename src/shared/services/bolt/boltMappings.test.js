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
  itemIntToString,
  arrayIntToString,
  extractNodesAndRelationshipsFromRecords,
  extractNodesAndRelationshipsFromRecordsForOldVis,
  extractPlan,
  flattenProperties,
  objIntToString,
  extractFromNeoObjects
} from './boltMappings'

describe('boltMappings', () => {
  describe('itemIntToString', () => {
    test('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {
          val: 'hello',
          checker: _ => false,
          converter: _ => false,
          expected: 'hello'
        },
        {
          val: ['hello'],
          checker: _ => false,
          converter: val => false,
          expected: ['hello']
        },
        {
          val: null,
          checker: _ => false,
          converter: _ => false,
          expected: null
        },
        {
          val: { str: 'hello' },
          checker: _ => true,
          converter: val => {
            val.str = val.str.toUpperCase()
            return val
          },
          expected: { str: 'HELLO' }
        }
      ]

      // When and Then
      tests.forEach(test => {
        expect(
          itemIntToString(test.val, {
            intChecker: test.checker,
            intConverter: test.converter
          })
        ).toEqual(test.expected)
      })
    })
  })
  describe('arrayIntToString', () => {
    test('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {
          val: ['hello', 1],
          checker: _ => false,
          converter: val => false,
          expected: ['hello', 1]
        },
        {
          val: ['hello', ['ola', 'hi']],
          checker: val => typeof val === 'string',
          converter: val => val.toUpperCase(),
          expected: ['HELLO', ['OLA', 'HI']]
        },
        {
          val: ['hello', 1],
          checker: val => typeof val === 'string',
          converter: val => val.toUpperCase(),
          expected: ['HELLO', 1]
        }
      ]

      // When and Then
      tests.forEach(test => {
        expect(
          arrayIntToString(test.val, {
            intChecker: test.checker,
            intConverter: test.converter
          })
        ).toEqual(test.expected)
      })
    })
  })
  describe('objIntToString', () => {
    test('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {
          val: { arr: ['hello'] },
          checker: _ => false,
          converter: val => false,
          expected: { arr: ['hello'] }
        },
        {
          val: {
            arr: ['hello', ['ola', 'hi']],
            str: 'hello',
            num: 2,
            obj: {
              num: 3,
              str: 'inner hello'
            }
          },
          checker: val => typeof val === 'string',
          converter: val => val.toUpperCase(),
          expected: {
            arr: ['HELLO', ['OLA', 'HI']],
            str: 'HELLO',
            num: 2,
            obj: {
              num: 3,
              str: 'INNER HELLO'
            }
          }
        }
      ]

      // When and Then
      tests.forEach(test => {
        expect(
          objIntToString(test.val, {
            intChecker: test.checker,
            intConverter: test.converter,
            objectConverter: obj => obj
          })
        ).toEqual(test.expected)
      })
    })
  })

  describe('extractNodesAndRelationshipsFromRecords', () => {
    test.skip('should map bolt records with a path to nodes and relationships', () => {
      let startNode = new driver.v1.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      let endNode = new driver.v1.types.Node('2', ['Movie'], {
        prop2: 'prop2'
      })
      let relationship = new driver.v1.types.Relationship(
        '3',
        startNode.identity,
        endNode.identity,
        'ACTED_IN',
        {}
      )
      let pathSegment = new driver.v1.types.PathSegment(
        startNode,
        relationship,
        endNode
      )
      let path = new driver.v1.types.Path(startNode, endNode, [pathSegment])
      let boltRecord = {
        keys: ['p'],
        get: key => path
      }

      let { nodes, relationships } = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        driver.v1.types
      )
      expect(nodes).to.have.lengthOf(2)
      let graphNodeStart = nodes.filter(node => node.id === '1')[0]
      expect(graphNodeStart).toBeDefined()
      expect(graphNodeStart.labels).toEqual(['Person'])
      expect(graphNodeStart.properties).toEqual({ prop1: 'prop1' })
      let graphNodeEnd = nodes.filter(node => node.id === '2')[0]
      expect(graphNodeEnd).toBeDefined()
      expect(graphNodeEnd.labels).toEqual(['Movie'])
      expect(graphNodeEnd.properties).toEqual({ prop2: 'prop2' })
      expect(relationships).to.have.lengthOf(1)
      expect(relationships[0].id).toEqual('3')
      expect(relationships[0].startNodeId).toEqual('1')
      expect(relationships[0].endNodeId).toEqual('2')
      expect(relationships[0].type).toEqual('ACTED_IN')
      expect(relationships[0].properties).toEqual({})
    })

    test.skip('should map bolt nodes and relationships to graph nodes and relationships', () => {
      let startNode = new driver.v1.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      let endNode = new driver.v1.types.Node('2', ['Movie'], {
        prop2: 'prop2'
      })
      let relationship = new driver.v1.types.Relationship(
        '3',
        startNode.identity,
        endNode.identity,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r', 'n1', 'n2'],
        get: key => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return startNode
          }
          if (key === 'n2') {
            return endNode
          }
        }
      }

      let { nodes, relationships } = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        driver.v1.types
      )
      expect(nodes).to.have.lengthOf(2)
      let graphNodeStart = nodes.filter(node => node.id === '1')[0]
      expect(graphNodeStart).toBeDefined()
      expect(graphNodeStart.labels).toEqual(['Person'])
      expect(graphNodeStart.properties).toEqual({ prop1: 'prop1' })
      let graphNodeEnd = nodes.filter(node => node.id === '2')[0]
      expect(graphNodeEnd).toBeDefined()
      expect(graphNodeEnd.labels).toEqual(['Movie'])
      expect(graphNodeEnd.properties).toEqual({ prop2: 'prop2' })
      expect(relationships).to.have.lengthOf(1)
      expect(relationships[0].id).toEqual('3')
      expect(relationships[0].startNodeId).toEqual('1')
      expect(relationships[0].endNodeId).toEqual('2')
      expect(relationships[0].type).toEqual('ACTED_IN')
      expect(relationships[0].properties).toEqual({})
    })

    test.skip('should not include relationships where neither start or end node is not in nodes list', () => {
      let relationship = new driver.v1.types.Relationship(
        '3',
        1,
        2,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r'],
        get: key => relationship
      }
      let relationships = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        driver.v1.types
      ).relationships
      expect(relationships.length).toBe(0)
    })
    test.skip('should not include relationships where end node is not in nodes list', () => {
      let startNode = new driver.v1.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      let relationship = new driver.v1.types.Relationship(
        '3',
        startNode.identity,
        2,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r', 'n1'],
        get: key => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return startNode
          }
        }
      }
      let relationships = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        driver.v1.types
      ).relationships
      expect(relationships.length).toBe(0)
    })
    test.skip('should not include relationships where start node is not in nodes list', () => {
      let endNode = new driver.v1.types.Node('2', ['Movie'], {
        prop2: 'prop2'
      })
      let relationship = new driver.v1.types.Relationship(
        '3',
        '1',
        endNode.identity,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r', 'n1'],
        get: key => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return endNode
          }
        }
      }
      let relationships = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        driver.v1.types
      ).relationships
      expect(relationships.length).toBe(0)
    })
  })
  describe('extractPlan', () => {
    const createPlan = () => {
      return {
        operatorType: 'operatorType',
        arguments: {
          LegacyExpression: 'legacy',
          ExpandExpression: 'expand',
          EstimatedRows: 10,
          Index: 1,
          version: 'version',
          KeyNames: ['keyname'],
          planner: 'planner',
          runtime: 'runtime',
          'planner-impl': 'planner-impl',
          'runtime-impl': 'runtime-impl',
          Signature: 'Signature'
        },
        identifiers: [],
        children: []
      }
    }

    const checkExtractedPlan = extractedPlan => {
      expect(extractedPlan).not.toBeNull()
      expect(extractedPlan.operatorType).toEqual('operatorType')
      expect(extractedPlan.identifiers).toEqual([])
      expect(extractedPlan.operatorType).toEqual('operatorType')
      expect(extractedPlan.LegacyExpression).toEqual('legacy')
      expect(extractedPlan.ExpandExpression).toEqual('expand')
      expect(extractedPlan.EstimatedRows).toEqual(10)
      expect(extractedPlan.Index).toEqual(1)
      expect(extractedPlan.version).toEqual('version')
      expect(extractedPlan.KeyNames).toEqual(['keyname'])
      expect(extractedPlan.planner).toEqual('planner')
      expect(extractedPlan.runtime).toEqual('runtime')
      expect(extractedPlan['planner-impl']).toEqual('planner-impl')
      expect(extractedPlan['runtime-impl']).toEqual('runtime-impl')
      expect(extractedPlan.Signature).toEqual('Signature')
    }

    test('should extract plan from result summary', () => {
      // Given
      const result = {
        summary: {
          plan: createPlan()
        }
      }
      const extractedPlan = extractPlan(result).root
      checkExtractedPlan(extractedPlan)
    })

    test('should extract profile from result summary', () => {
      // Given
      const profile = createPlan()
      profile.dbHits = 20
      profile.rows = 14
      const result = {
        summary: {
          profile: profile
        }
      }
      const extractedPlan = extractPlan(result).root
      checkExtractedPlan(extractedPlan)
      expect(extractedPlan.DbHits).toEqual(20)
      expect(extractedPlan.Rows).toEqual(14)
    })

    test('should return null if no plan or profile is available', () => {
      const result = {
        summary: {}
      }
      expect(extractPlan(result)).toBeNull()
    })
  })
  describe('flattenProperties', () => {
    test('should map properties to object when properties exist', () => {
      // Given
      const result = [[{ properties: { foo: 'bar' } }]]
      const expectedResult = [[{ foo: 'bar' }]]

      // When
      const flattenedProperties = flattenProperties(result)

      // Then
      expect(flattenedProperties).toEqual(expectedResult)
    })
    test('should not map properties to object when properties do not exist', () => {
      // Given
      const result = [[{ x: { foo: 'bar' } }]]

      // When
      const flattenedProperties = flattenProperties(result)

      // Then
      expect(flattenedProperties).toEqual(result)
    })
  })
  describe('extractNodesAndRelationshipsFromRecordsForOldVis', () => {
    test('should recursively look for graph items', () => {
      // Given
      const firstNode = new driver.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      const nodeCollection = [
        new driver.types.Node('2', ['Person'], { prop1: 'prop1' }),
        new driver.types.Node('3', ['Person'], { prop1: 'prop1' }),
        new driver.types.Node('4', ['Person'], { prop1: 'prop1' })
      ]
      const boltRecord = {
        keys: ['n', 'c'],
        get: key => {
          if (key === 'n') {
            return firstNode
          }
          if (key === 'c') {
            return nodeCollection
          }
        }
      }
      const records = [boltRecord]

      // When
      const out = extractNodesAndRelationshipsFromRecordsForOldVis(
        records,
        driver.types,
        false,
        {
          intChecker: () => true,
          intConverter: a => a
        }
      )

      // Then
      expect(out.nodes.length).toEqual(4)
    })
    test('should find items in paths with segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new driver.types.Node(1, ['X'], { x: 1 })
      const rel1 = new driver.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const end1 = new driver.types.Node(2, ['Y'], { y: 1 })
      const rel2 = new driver.types.Relationship(6, 4, 5, 'REL2', { rel: 2 })
      const end = new driver.types.Node(5, ['Y'], { y: 2 })
      const segments = [
        new driver.types.PathSegment(start, rel1, end1),
        new driver.types.PathSegment(end1, rel2, end)
      ]
      const path = new driver.types.Path(start, end, segments)
      const boltRecord = {
        keys: ['p'],
        get: key => {
          if (key === 'p') return path
        }
      }
      const records = [boltRecord]

      // When
      const out = extractNodesAndRelationshipsFromRecordsForOldVis(
        records,
        driver.types,
        false,
        converters
      )

      // Then
      expect(out.nodes.length).toEqual(4)
    })
    test('should find items in paths zero segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new driver.types.Node(1, ['X'], { x: 2 })
      const end = start
      const segments = []
      const path = new driver.types.Path(start, end, segments)
      const boltRecord = {
        keys: ['p'],
        get: key => {
          if (key === 'p') return path
        }
      }
      const records = [boltRecord]

      // When
      const out = extractNodesAndRelationshipsFromRecordsForOldVis(
        records,
        driver.types,
        false,
        converters
      )

      // Then
      expect(out.nodes.length).toEqual(1)
      expect(out.nodes[0].properties.x).toEqual(2)
    })
  })
  describe('extractFromNeoObjects', () => {
    test('should extract objects from paths with zero segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new driver.types.Node(1, ['X'], { x: 1 })
      const end = start
      const segments = []
      const path = new driver.types.Path(start, end, segments)

      // When
      const result = extractFromNeoObjects(path, converters)
      // Then
      expect(result.length).toBe(1)
      expect(result[0].x).toBe(1)
    })
    test('should extract objects from paths with one segment', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new driver.types.Node(1, ['X'], { x: 1 })
      const end = new driver.types.Node(2, ['Y'], { y: 1 })
      const rel = new driver.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const segments = [new driver.types.PathSegment(start, rel, end)]
      const path = new driver.types.Path(start, end, segments)

      // When
      const result = extractFromNeoObjects(path, converters)

      // Then
      expect(result.length).toBe(3)
      expect(result[0].x).toBe(1)
      expect(result[1].rel).toBe(1)
      expect(result[2].y).toBe(1)
    })
    test('should extract objects from paths with multiple segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new driver.types.Node(1, ['X'], { x: 1 })
      const rel1 = new driver.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const end1 = new driver.types.Node(2, ['Y'], { y: 1 })
      const rel2 = new driver.types.Relationship(6, 4, 5, 'REL2', { rel: 2 })
      const end = new driver.types.Node(5, ['Y'], { y: 2 })
      const segments = [
        new driver.types.PathSegment(start, rel1, end1),
        new driver.types.PathSegment(end1, rel2, end)
      ]
      const path = new driver.types.Path(start, end, segments)

      // When
      const result = extractFromNeoObjects(path, converters)

      // Then
      expect(result.length).toBe(6)
      expect(result[0].x).toBe(1)
      expect(result[1].rel).toBe(1)
      expect(result[2].y).toBe(1)
      expect(result[3].y).toBe(1) // Same as above line
      expect(result[4].rel).toBe(2)
      expect(result[5].y).toBe(2)
    })
  })
})
