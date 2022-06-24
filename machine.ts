// eslint-disable max-len

import { States } from './schema'
import { Schema } from './schema'
import { Key_Base } from './schema'
import { Schema_States } from './schema'
import { Schema_Paths } from './schema'
import { States_Keys } from './schema'
import { States_Data } from './schema'
import { States_Values } from './schema'
import { Paths_Data } from './schema'

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
	go  <Key extends States_Keys<Schema_States<Sc>>> (key: Key, ...args: Parameters<States_Data<Schema_States<Sc>>[Key]['enter']>): void,
	can <Key extends States_Keys<Schema_States<Sc>>> (key: Key): boolean,
	key: States_Keys<Schema_States<Sc>>,
	state: States_Values<Schema_States<Sc>>,
	is <Key extends States_Keys<Schema_States<Sc>>> (key: Key): this is Machine_Narrow<this, Key>,
	must <Key extends States_Keys<Schema_States<Sc>>> (key: Key): asserts this is Machine_Narrow<this, Key>,
}

export function Machine
<
	Sc extends Schema<any, any>,
	Key extends States_Keys<Schema_States<Sc>>,
>
(schema: Sc, key: Key, ...args: Parameters<States_Data<Schema_States<Sc>>[Key]['enter']>)
:
	Machine<Sc>
{
	const $ = {}

	return ($ as any)
}
