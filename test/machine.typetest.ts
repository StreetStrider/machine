// eslint-disable max-len

import { Schema }  from 'machine'
import { Machine } from 'machine'

const
schema = Schema()
.state('A', (n: number) => n ** 2)
.state('B', () => {})
.state('C', () => {})
.state('.')
.path('A', 'B')
.path('B', 'C')
.path('C', 'A')
.path('C', '.')

schema // Schema<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; }>, Paths<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; }>, { A: { B: true; }; } & { B: { C: true; }; } & { C: { A: true; }; }>>

const
machine = Machine(schema, 'A', 17)
machine // $ExpectType Machine<Schema<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; } & { ".": State_Dscr<[], void>; }>, Paths<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; } & { ".": State_Dscr<[], void>; }>, { A: { B: true; }; } & { B: { C: true; }; } & { C: { A: true; }; } & { C: { ".": true; }; }>>>

const
machine_void = Machine(schema, '.')
machine_void // $ExpectType Machine<Schema<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; } & { ".": State_Dscr<[], void>; }>, Paths<States<{ A: State_Dscr<[n: number], number>; } & { B: State_Dscr<[], void>; } & { C: State_Dscr<[], void>; } & { ".": State_Dscr<[], void>; }>, { A: { B: true; }; } & { B: { C: true; }; } & { C: { A: true; }; } & { C: { ".": true; }; }>>>

type M = typeof machine

machine.go('A') // $ExpectError
machine.go('D') // $ExpectError
machine.go('A', 17) // $ExpectType void

machine.can('A') // $ExpectType boolean
machine.can('D') // $ExpectError

machine.key   // $ExpectType "A" | "B" | "C" | "."
machine.state // $ExpectType number | void

const w1 = machine.when('A', (x) =>
{
	x // $ExpectType number
	return x ** 2
})
w1 // $ExpectType number | undefined

const w2 = machine.when('B', (x) =>
{
	x // $ExpectType void
	return false
})
w2 // $ExpectType boolean | undefined

function refined (machine: M)
{
	if (machine.is('A'))
	{
		machine.key   // $ExpectType "A"
		machine.state // $ExpectType number
	}
}

function guarded (machine: M)
{
	machine.must('A')

	machine.key   // $ExpectType "A"
	machine.state // $ExpectType number
}
