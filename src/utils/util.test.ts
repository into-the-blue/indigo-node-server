import { toCamelCase } from './util'
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
