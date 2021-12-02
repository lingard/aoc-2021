import { constant, pipe } from 'fp-ts/lib/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import * as M from 'fp-ts/Monoid'
import * as n from 'fp-ts/number'
import * as b from 'fp-ts/boolean'

import { increases, Input, readInput } from './1a'

const chopN = (n: number) => (ns: ReadonlyArray<number>) =>
  pipe(
    ns,
    RA.chop((as) => [
      pipe(as, RA.takeLeft(n)),
      pipe(
        as.length > n,
        b.fold(constant([]), () => as.slice(1))
      ),
    ])
  )

export const main = pipe(
  readInput('input/1', Input),
  TE.map((values) =>
    pipe(values, chopN(3), RA.map(M.concatAll(n.MonoidSum)), increases)
  )
)
