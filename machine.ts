// TODO: machine final? or explicit end state ($leave)
// TODO: single arg state.add
// eslint-disable max-len

import { Key_Base } from './schema'
import { States_Map_Base } from './schema'
import { Paths_Map_Base } from './schema'

import { States } from './schema'
import { Paths } from './schema'
import { Schema } from './schema'

import { States_Keys } from './schema'
import { States_Data } from './schema'
import { States_Values } from './schema'

import { Paths_Data } from './schema'

import { Schema_States } from './schema'
import { Schema_Paths } from './schema'
import { Schema_Enter } from './schema'


export type Machine_Schema <M extends Machine<any>> = M extends Machine<infer Schema> ? Schema : never
export type Machine_Narrow
<
	M extends Machine<any>,
	Key extends States_Keys<Schema_States<Machine_Schema<M>>>,
>
=
	M extends Machine<Schema<States<infer S>, any>>
	?
		Machine_Concrete<Key, ReturnType<S[Key]['enter']>>
	:
		never

type Machine_Concrete <Key, State> =
{
	key: Key,
	state: State,
}

export interface Machine <Sc extends Schema<any, any>>
{
	key: States_Keys<Schema_States<Sc>>,
	state: States_Values<Schema_States<Sc>>,

	is <Key extends States_Keys<Schema_States<Sc>>> (key: Key): this is Machine_Narrow<this, Key>,
	must <Key extends States_Keys<Schema_States<Sc>>> (key: Key): asserts this is Machine_Narrow<this, Key>,

	can <Key extends States_Keys<Schema_States<Sc>>> (key: Key): boolean,
	go  <Key extends States_Keys<Schema_States<Sc>>> (key: Key, ...args: Parameters<Schema_Enter<Sc, Key>>): void,

	when <Key extends States_Keys<Schema_States<Sc>>, P> (key: Key, fn: (state: ReturnType<Schema_Enter<Sc, Key>>) => P): P | undefined,
}

export function Machine
<
	Sc extends Schema<States<any>, Paths<States<States_Map_Base>, Paths_Map_Base>>,
	// Sc extends Schema<States<States_Map_Base>, Paths<States<States_Map_Base>, Paths_Map_Base>>,
	Key extends States_Keys<Schema_States<Sc>>,
>
(schema: Sc, key: Key, ...args: Parameters<Schema_Enter<Sc, Key>>)
:
	Machine<Sc>
{
	const $ =
	{
		key: null as any,
		state: null as any,

		is,
		must,

		can,
		go,
		when,
	}

	function is (key: Key)
	{
		return ($.key === key)
	}

	function must (key: Key)
	{
		if (! is(key)) throw new TypeError('wrong_machine_state')
	}

	function can (key: Key)
	{
		return schema.paths.has($.key, key as any)
	}

	function go (key: Key, ...args: Parameters<Schema_Enter<Sc, Key>>)
	{
		$leave($.key)
		$enter(key, ...args)
	}

	function $leave (key: Key)
	{
		const { leave } = schema.states.get(key)
		leave?.()
	}

	function $enter (key: Key, ...args: Parameters<Schema_Enter<Sc, Key>>)
	{
		const { enter } = schema.states.get(key)
		const state = enter(...args)

		$.key = key
		$.state = state
	}

	function when <P> (key: Key, fn: (state: ReturnType<Schema_Enter<Sc, Key>>) => P): P | undefined
	{
		if (! is(key)) return

		return fn($.state)
	}

	$enter(key, ...args)
	return ($ as any)
}
