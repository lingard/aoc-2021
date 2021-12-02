import * as E from 'fp-ts/Either'
import { main as a } from '../src/2a'
import { main as b } from '../src/2b'
import { run } from '../src/util'

describe('day-2', () => {
  test('a', async () => {
    const result = await run(a)

    expect(result).toEqual(E.right(2027977))
  })

  test('b', async () => {
    const result = await run(b)

    expect(result).toEqual(E.right(1903644897))
  })
})
