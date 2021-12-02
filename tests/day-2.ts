import * as E from 'fp-ts/Either'
import { main as a, main2 as a2, main3 as a3 } from '../src/2a'
import { main as b } from '../src/2b'
import { run } from '../src/util'

describe('day-2', () => {
  test('a', async () => {
    const result = await run(a)
    const result2 = await run(a2)
    const result3 = await run(a3)

    expect(result).toEqual(E.right(2027977))
    expect(result2).toEqual(E.right(2027977))
    expect(result3).toEqual(E.right(2027977))
  })

  test('b', async () => {
    const result = await run(b)

    expect(result).toEqual(E.right(1903644897))
  })
})
