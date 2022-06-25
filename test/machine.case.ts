
import { Schema }  from 'machine'
import { Machine } from 'machine'

import { expect } from 'chai'

describe('Machine', () =>
{
	it('works', () =>
	{
		const order: string[] = []
		function record (x: string, val?: any)
		{
			return () => (order.push(x), val)
		}

		const schema = Schema()
		.state('A', record('A_enter', 17), record('A_leave'))
		.state('B', record('B_enter', 18), record('B_leave'))
		.state('C', record('C_enter', 19), record('C_leave'))
		.path('A', 'B')
		.path('B', 'C')
		.path('C', 'A')
		.path('A', 'A')

		expect(schema.states.keys()).deep.eq([ 'A', 'B', 'C' ])
		expect(schema.paths.keys()).deep.eq(
		[
			[ 'A', 'B' ],
			[ 'B', 'C' ],
			[ 'C', 'A' ],
			[ 'A', 'A' ],
		])

		const machine = Machine(schema, 'A')
		expect(machine.key).eq('A')
		expect(machine.state).eq(17)
		expect(schema.states.keys().map(machine.is)).deep.eq([ true, false, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, true, false ])

		expect(machine.must('A')).eq(undefined)
		expect(() => machine.must('B')).throw()
		expect(() => machine.must('C')).throw()

		machine.go('B')
		expect(machine.key).eq('B')
		expect(machine.state).eq(18)
		expect(schema.states.keys().map(machine.is)).deep.eq([ false, true, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ false, false, true ])

		expect(() => machine.must('A')).throw()
		expect(machine.must('B')).eq(undefined)
		expect(() => machine.must('C')).throw()

		machine.go('C')
		expect(machine.key).eq('C')
		expect(machine.state).eq(19)
		expect(schema.states.keys().map(machine.is)).deep.eq([ false, false, true ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, false, false ])

		expect(() => machine.must('A')).throw()
		expect(() => machine.must('B')).throw()
		expect(machine.must('C')).eq(undefined)

		machine.go('A')
		expect(machine.key).eq('A')
		expect(machine.state).eq(17)
		expect(schema.states.keys().map(machine.is)).deep.eq([ true, false, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, true, false ])

		expect(machine.must('A')).eq(undefined)
		expect(() => machine.must('B')).throw()
		expect(() => machine.must('C')).throw()

		machine.go('A')
		expect(machine.key).eq('A')
		expect(machine.state).eq(17)
		expect(schema.states.keys().map(machine.is)).deep.eq([ true, false, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, true, false ])

		expect(machine.must('A')).eq(undefined)
		expect(() => machine.must('B')).throw()
		expect(() => machine.must('C')).throw()

		expect(order).deep.eq(
		[
			'A_enter',
			'A_leave',
			'B_enter',
			'B_leave',
			'C_enter',
			'C_leave',
			'A_enter',
			'A_leave',
			'A_enter',
			// 'A_leave',
		])

		const w_A = machine.when('A', (state) => state + 100)
		expect(w_A).eq(117)

		const w_B = machine.when('B', (state) => state + 100)
		expect(w_B).eq(undefined)
	})
})
