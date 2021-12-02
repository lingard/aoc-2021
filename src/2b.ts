import { pipe, constant } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import * as Lens from 'monocle-ts/Lens'
import { readInput } from './1a'
import { Command, Input, Position as P } from './2a'

interface Position extends P {
  aim: number
}

const emptyPosition: Position = {
  depth: 0,
  horizontal: 0,
  aim: 0,
}

const positionLens = Lens.id<Position>()

const horizontalPositionLens = pipe(positionLens, Lens.prop('horizontal'))

const depthPositionLens = pipe(positionLens, Lens.prop('depth'))

const aimPositionLens = pipe(positionLens, Lens.prop('aim'))

const reducer = (position: Position, command: Command): Position =>
  pipe(
    command,
    Command.match({
      forward: (steps) =>
        pipe(
          position,
          horizontalPositionLens.set(position.horizontal + steps),
          depthPositionLens.set(position.depth + position.aim * steps)
        ),
      up: (steps) => pipe(position, aimPositionLens.set(position.aim - steps)),
      down: (steps) =>
        pipe(position, aimPositionLens.set(position.aim + steps)),
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
