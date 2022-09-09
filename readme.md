# machine

My approach on a strongly typed finite-state machine. Simple design, strong guarantees, both type guards and asserts for a running machine.

```ts
import { Schema }  from 'machine'
import { Machine } from 'machine'

const schema = Schema()
.state('init', () => { /* enter init */ }, () => { /* leave init */ })
.state('running', (id: number) => ({ id }))
.state('stopped')
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
```

## license
ISC, © Strider, 2022.
