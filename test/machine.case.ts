
import { States }  from 'machine'

import { Schema }  from 'machine'
import { Machine } from 'machine'

import { expect } from 'chai'

describe('Machine', () =>
{
	it('example', () =>
	{
		const schema = Schema()
		.state('init', () => { /* enter init */ }, () => { /* leave init */ })
		.state('running', (id: number) => ({ id }))
		.state('stopped', () => {})
		.path('init', 'running')
		.path('running', 'running')
		.path('running', 'stopped')

		const machine = Machine(schema, 'init')
		machine.is('init')    // → true
		machine.is('running') // → false

		machine.go('running', 1001)
		machine.is('running') // → true
		machine.key   // → 'running'
		machine.state // → { id: 1001 }

		machine.go('running', 1002)
		machine.go('running', 1003)

		machine.go('stopped')

		if (machine.is('running')) {
			machine.state // will be refined to proper type
		}
		function machinery (machine: Machine<any>) {
			machine.must('running') // will throw if in wrong state
			machine.state // will be refined to proper type
		}
	})

	it('positive', () =>
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
		expect(() => machine.must('B')).throw(TypeError, 'wrong_machine_state')
		expect(() => machine.must('C')).throw(TypeError, 'wrong_machine_state')

		machine.go('B')
		expect(machine.key).eq('B')
		expect(machine.state).eq(18)
		expect(schema.states.keys().map(machine.is)).deep.eq([ false, true, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ false, false, true ])

		expect(() => machine.must('A')).throw(TypeError, 'wrong_machine_state')
		expect(machine.must('B')).eq(undefined)
		expect(() => machine.must('C')).throw(TypeError, 'wrong_machine_state')

		machine.go('C')
		expect(machine.key).eq('C')
		expect(machine.state).eq(19)
		expect(schema.states.keys().map(machine.is)).deep.eq([ false, false, true ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, false, false ])

		expect(() => machine.must('A')).throw(TypeError, 'wrong_machine_state')
		expect(() => machine.must('B')).throw(TypeError, 'wrong_machine_state')
		expect(machine.must('C')).eq(undefined)

		machine.go('A')
		expect(machine.key).eq('A')
		expect(machine.state).eq(17)
		expect(schema.states.keys().map(machine.is)).deep.eq([ true, false, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, true, false ])

		expect(machine.must('A')).eq(undefined)
		expect(() => machine.must('B')).throw(TypeError, 'wrong_machine_state')
		expect(() => machine.must('C')).throw(TypeError, 'wrong_machine_state')

		machine.go('A')
		expect(machine.key).eq('A')
		expect(machine.state).eq(17)
		expect(schema.states.keys().map(machine.is)).deep.eq([ true, false, false ])
		expect(schema.states.keys().map(machine.can)).deep.eq([ true, true, false ])

		expect(machine.must('A')).eq(undefined)
		expect(() => machine.must('B')).throw(TypeError, 'wrong_machine_state')
		expect(() => machine.must('C')).throw(TypeError, 'wrong_machine_state')

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

	it('negative', () =>
	{
		expect(() =>
		{
			Schema()
			.state('A', () => {})
			.state('A', (n: number) => n + 1)
		})
		.throw(TypeError, 'state_taken_already')

		expect(() =>
		{
			Schema()
			.state('A', () => {})
			// @ts-ignore
			.states.get('B')
		})
		.throw(TypeError, 'wrong_key')

		expect(() =>
		{
			Schema()
			.state('A', () => {})
			// @ts-ignore
			.path('B', 'A')
		})
		.throw(TypeError, 'wrong_src')

		expect(() =>
		{
			Schema()
			.state('A', () => {})
			// @ts-ignore
			.path('A', 'B')
		})
		.throw(TypeError, 'wrong_dst')

		expect(() =>
		{
			Schema()
			.state('A', () => {})
			.state('B', () => {})
			.path('A', 'B')
			.path('A', 'B')
		})
		.throw(TypeError, 'path_taken_already')

		expect(() =>
		{
			Schema()
			.state('A', () => {})
			.state('B', () => {})
			.path('A', 'B')
			.paths.rebase(States())
		})
		.throw(TypeError, 'wrong_base')

		expect(() =>
		{
			const schema = Schema()
			.state('A', () => {})
			.state('B', () => {})
			.path('A', 'B')

			// @ts-ignore
			const machine = Machine(schema, 'C')
		})
		.throw(TypeError, 'wrong_key')

		expect(() =>
		{
			const schema = Schema()
			.state('A', () => {})
			.state('B', () => {})
			.path('A', 'B')

			const machine = Machine(schema, 'A')

			// @ts-ignore
			machine.go('C')
		})
		.throw(TypeError, 'wrong_key')
	})
})
