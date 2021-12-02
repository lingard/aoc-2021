import fs from 'fs'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'
import { Union, of } from 'ts-union'
import * as console from 'fp-ts/Console'
import * as D from 'io-ts/Decoder'

export function readFile(filename: string): TE.TaskEither<Error, string> {
  return TE.tryCatch(() => fs.promises.readFile(filename, 'utf8'), E.toError)
}

export function exit(code: number): IO.IO<never> {
  return () => process.exit(code)
}

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

export const main = (ma: TE.TaskEither<AppError, unknown>) =>
  ma().then(
    E.fold(
      (err) => {
        console.error(err)
        process.exit(1)
      },
      (result) => {
        console.log(result)
        process.exit(0)
      }
    )
  )

export function spy<A>(a: A): A {
  console.log(a)()
  return a
}
