import * as E from 'fp-ts/Either'
import { main as a } from '../src/1a'
import { main as b } from '../src/1b'
import { run } from '../src/util'

describe('day-1', () => {
  test('a', async () => {
    const result = await run(a)

    expect(result).toEqual(E.right(1466))
  })

  test('b', async () => {
    const result = await run(b)

    expect(result).toEqual(E.right(1491))
  })
})
