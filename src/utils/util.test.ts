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
console.log(JSON.stringify(examples.map(toCamelCase)))
