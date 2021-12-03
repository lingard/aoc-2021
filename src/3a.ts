import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import * as A from 'fp-ts/Array'
import * as RA from 'fp-ts/ReadonlyArray'
import * as M from 'fp-ts/Monoid'
import * as n from 'fp-ts/number'
import * as D from 'io-ts/Decoder'
import { readInput } from './util'

type Bit = '1' | '0'

const bit = pipe(
  D.string,
  D.refine((n): n is Bit => {
    if (n !== '1' && n !== '0') {
      return false
    }

    return true
  }, 'bit')
)

type Binary = [Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit]

const Bin: D.Decoder<unknown, Binary> = pipe(
  D.string,
  D.map((s) => s.split('')),
  D.compose(D.tuple(bit, bit, bit, bit, bit, bit, bit, bit, bit, bit, bit, bit))
)

const Input = D.array(Bin)

type Input = D.TypeOf<typeof Input>

interface BitCount {
  0: number
  1: number
}

const MonoidBitCount = M.getStructMonoid({
  0: n.MonoidSum,
  1: n.MonoidSum,
})

const bitCount = (b: Bit): BitCount => ({
  0: b === '0' ? 1 : 0,
  1: b === '1' ? 1 : 0,
})

type BinaryCount = readonly [
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount,
  BitCount
]

const binCount = (b: Binary): BinaryCount =>
  pipe(b, RA.map(bitCount), (a) => a as BinaryCount)

const MonoidBinaryCount = M.tuple(
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount,
  MonoidBitCount
)

const mostCommon = (b: BitCount): Bit => (b[0] > b[1] ? '0' : '1')
const leastCommon = (b: BitCount): Bit => (b[0] > b[1] ? '1' : '0')

const parseBin = (b: string) => parseInt(b, 2)

const sumGamma = (bin: BinaryCount) =>
  pipe(bin, RA.map(mostCommon), (bs) => bs.join(''), parseBin)

const sumEpsilon = (bin: BinaryCount) =>
  pipe(bin, RA.map(leastCommon), (bs) => bs.join(''), parseBin)

export const main = pipe(
  readInput('input/3', Input),
  TE.map((ns) =>
    pipe(
      ns,
      A.map(binCount),
      M.concatAll(MonoidBinaryCount),
      (b) => sumGamma(b) * sumEpsilon(b)
    )
  )
)
