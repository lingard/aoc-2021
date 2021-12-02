import fs from 'fs'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'
import { Union, of } from 'ts-union'
import * as console from 'fp-ts/Console'

export function readFile(filename: string): TE.TaskEither<Error, string> {
  return TE.tryCatch(() => fs.promises.readFile(filename, 'utf8'), E.toError)
}

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

export const NumberFromString = pipe(
  D.string,
  D.parse((s) => {
    const n = +s

    return isNaN(n) || s.trim() === ''
      ? D.failure(s, 'NumberFromString')
      : D.success(n)
  })
)

export const AppError = Union({
  FSError: of<Error>(),
  ValidationErrors: of<D.DecodeError>(),
})

type AppError = typeof AppError.T

export function formatError(error: AppError): string {
  return AppError.match(error, {
    FSError: (error) => error.message,
    ValidationErrors: D.draw,
  })
}

export const run = (ma: TE.TaskEither<AppError, unknown>) => ma()

export const trace = <E, A>(fa: TE.TaskEither<E, A>) =>
  pipe(
    fa,
    TE.chainFirstIOK((a) => console.log(a))
  )
