import { constant, pipe } from 'fp-ts/lib/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as M from 'fp-ts/Monoid'
import * as n from 'fp-ts/number'
import * as b from 'fp-ts/boolean'

import { AppError, readFile } from './util'
import { increases, Input } from './1a'

const chopN = (n: number) => (i: Input) =>
  pipe(
    i,
    RA.chop((as) => [
      pipe(as, RA.takeLeft(n)),
      pipe(
        as.length > n,
        b.fold(constant([]), () => as.slice(1))
      ),
    ])
  )

const parseInput = (input: string) =>
  pipe(input.split('\n'), Input.decode, E.mapLeft(AppError.ValidationErrors))

export const main = pipe(
  readFile('input/1'),
  TE.mapLeft(AppError.FSError),
  TE.chainEitherK(parseInput),
  TE.map((values) =>
    pipe(values, chopN(3), RA.map(M.concatAll(n.MonoidSum)), increases)
  )
)
