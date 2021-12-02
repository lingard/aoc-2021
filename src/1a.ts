import { pipe } from 'fp-ts/lib/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as n from 'fp-ts/number'
import * as D from 'io-ts/Decoder'

import { AppError, NumberFromString, readFile } from './util'

export const Input = D.array(NumberFromString)

export type Input = D.TypeOf<typeof Input>

export const parseInput =
  <A>(decoder: D.Decoder<unknown, A>) =>
  (input: string) =>
    pipe(
      input.split('\n'),
      decoder.decode,
      E.mapLeft(AppError.ValidationErrors)
    )

export const readInput = <A>(path: string, decoder: D.Decoder<unknown, A>) =>
  pipe(
    readFile(path),
    TE.mapLeft(AppError.FSError),
    TE.chainEitherK(parseInput(decoder))
  )

export const increases = (as: ReadonlyArray<number>) =>
  pipe(
    RA.zip(as, pipe(as, RA.dropLeft(1))),
    RA.foldMap(n.MonoidSum)(([a, b]) => (b > a ? 1 : 0))
  )

export const main = pipe(readInput('input/1', Input), TE.map(increases))
