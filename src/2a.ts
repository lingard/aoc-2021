import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as RA from 'fp-ts/ReadonlyArray'
import { Union, of } from 'ts-union'
import * as D from 'io-ts/Decoder'
import * as Lens from 'monocle-ts/Lens'
import * as M from 'fp-ts/Monoid'
import * as n from 'fp-ts/number'
import { NumberFromString, readInput } from './util'

export const Command = Union({
  forward: of<number>(),
  down: of<number>(),
  up: of<number>(),
})

export type Command = typeof Command.T

export interface Position {
  horizontal: number
  depth: number
}

const emptyPosition = {
  horizontal: 0,
  depth: 0,
}

export const horizontalPositionLens = pipe(
  Lens.id<Position>(),
  Lens.prop('horizontal')
)

export const depthPositionLens = pipe(Lens.id<Position>(), Lens.prop('depth'))

export const CommandFromString = pipe(
  D.string,
  D.map((s) => s.split(' ')),
  D.compose(D.tuple(D.string, NumberFromString)),
  D.parse(([command, steps]) => {
    switch (command) {
      case 'forward': {
        return D.success(Command.forward(steps))
      }

      case 'up': {
        return D.success(Command.up(steps))
      }

      case 'down': {
        return D.success(Command.down(steps))
      }

      default: {
        return D.failure(command, 'CommandFromString')
      }
    }
  })
)

export const Input = D.array(CommandFromString)

const sumPosition = ({ horizontal, depth }: Position) => horizontal * depth

const reducer = (position: Position, command: Command): Position =>
  pipe(
    command,
    Command.match({
      forward: (steps) =>
        pipe(position, horizontalPositionLens.set(position.horizontal + steps)),
      up: (steps) =>
        pipe(position, depthPositionLens.set(position.depth - steps)),
      down: (steps) =>
        pipe(position, depthPositionLens.set(position.depth + steps)),
    })
  )

export const main = pipe(
  readInput('input/2', Input),
  TE.map((commands) =>
    pipe(commands, RA.reduce(emptyPosition, reducer), sumPosition)
  )
)

// -------------------------------------------------------------------------------------
// monoid version
// -------------------------------------------------------------------------------------

const monoidPosition = M.struct<Position>({
  depth: n.MonoidSum,
  horizontal: n.MonoidSum,
})

const positionFromCommand = (command: Command): Position =>
  pipe(
    command,
    Command.match({
      forward: (steps) =>
        pipe(monoidPosition.empty, horizontalPositionLens.set(steps)),
      up: (steps) => pipe(monoidPosition.empty, depthPositionLens.set(-steps)),
      down: (steps) => pipe(monoidPosition.empty, depthPositionLens.set(steps)),
    })
  )

export const main2 = pipe(
  readInput('input/2', Input),
  TE.map((commands) =>
    pipe(
      commands,
      RA.map(positionFromCommand),
      M.concatAll(monoidPosition),
      sumPosition
    )
  )
)

/** "parallel" version */
export const main3 = pipe(
  readInput('input/2', Input),
  TE.chainTaskK((commands) =>
    pipe(
      commands,
      RA.traverse(T.ApplicativePar)((command) =>
        T.of(positionFromCommand(command))
      )
    )
  ),
  TE.map((positions) =>
    pipe(positions, M.concatAll(monoidPosition), sumPosition)
  )
)
