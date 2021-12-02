import { pipe, constant } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import { Union, of } from 'ts-union'
import * as D from 'io-ts/Decoder'
import * as Lens from 'monocle-ts/Lens'
import { readInput } from './1a'
import { NumberFromString } from './util'

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
      default: constant(position),
    })
  )

export const main = pipe(
  readInput('input/2', Input),
  TE.map((commands) =>
    pipe(
      commands,
      RA.reduce(emptyPosition, reducer),
      ({ horizontal, depth }) => horizontal * depth
    )
  )
)
