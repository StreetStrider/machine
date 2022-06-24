// eslint-disable max-len

import { Schema }  from 'machine'
import { Machine } from 'machine'

const
schema = Schema()
.state('A', (n: number) => n ** 2)
.state('B', () => {})
.state('C', () => {})
.path('A', 'B')
.path('B', 'C')
.path('C', 'A')

schema // Schema<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; }>, Paths<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; }>, { A: { B: true; }; } & { B: { C: true; }; } & { C: { A: true; }; }>>

const
machine = Machine(schema, 'A', 17)
machine // $ExpectType Machine<Schema<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; }>, Paths<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; }>, { A: { B: true; }; } & { B: { C: true; }; } & { C: { A: true; }; }>>>

type M = typeof machine

machine.go('A') // $ExpectError
machine.go('A', 17) // $ExpectType void
machine.go('D') // $ExpectError

machine.can('A') // $ExpectType boolean
machine.can('D') // $ExpectError

machine.key // $ExpectType "A" | "B" | "C"
machine.state // $ExpectType number | void

if (machine.is('A'))
{
	machine.key // $ExpectType "A"
	machine.state // $ExpectType number
}

function guarded (machine: M)
{
	machine.must('A')

	machine.key // $ExpectType "A"
	machine.state // $ExpectType number
}
