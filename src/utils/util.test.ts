import { toCamelCase } from './util'
import { ObjectId } from 'bson'
const examples = [
  {
    tags: ['str1', 'str2', 'str3'],
  },
  {
    tags: [
      { a_a: 'aa' },
      {
        b_b: 'bb',
      },
      [
        {
          c_c: 'cc',
        },
      ],
    ],
  },
]

test('should be camel case', (done) => {
  const camelCased = examples.map(toCamelCase)
  expect(camelCased).toEqual([
    {
      tags: ['str1', 'str2', 'str3'],
    },
    {
      tags: [
        { aA: 'aa' },
        {
          bB: 'bb',
        },
        [
          {
            cC: 'cc',
          },
        ],
      ],
    },
  ])
  done()
})

test('objectId should be transformed to string', (done) => {
  const example = {
    user_id: new ObjectId('5e64c11a7a189568b8525d27'),
  }
  expect(toCamelCase(example)).toEqual({
    userId: '5e64c11a7a189568b8525d27',
  })
  done()
})
