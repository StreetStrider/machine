
export type Key_Base = string
export type States_Map_Base  = { [ key: Key_Base ]: (...args: any[]) => any }
export type States_Map_Empty = {}

export type States_Keys <T> = T extends States<infer Map> ? keyof Map : never

export type States <States_Map extends States_Map_Base> =
{
	add
	<
		Key extends Key_Base,
		Args extends unknown[],
		Target,
	>
	(key: Key, fn: (...args: Args) => Target)
	:
		Key extends keyof States_Map
		?
			never
		:
			States<States_Map & { [ key in Key ]: (...args: Args) => Target }>,

	has <Key extends Key_Base> (key: Key)
	:
		Key extends keyof States_Map ? true : false,
}

export function States (states: States_Map_Base = {}): States<States_Map_Empty>
{
	const $ =
	{
		add,
		has,
	}

	function add (key: Key_Base, fn: (...args: unknown[]) => unknown)
	{
		if (has(key))
		{
			throw new TypeError('state_taken_already')
		}

		return States({ ...states, [ key ]: fn })
	}

	function has (key: Key_Base)
	{
		return (key in states)
	}

	return ($ as any)
}


export type Paths_Item = { [ dst: Key_Base ]: true }
export type Paths_Map_Base = { [ src: Key_Base ]: Paths_Item }
export type Paths_Map_Empty = {}

export type Paths <Base extends States<any>, Path extends Paths_Map_Base> =
{
	add
	<
		Src extends Key_Base,
		Dst extends Key_Base,
	>
	(src: Src, dst: Dst)
	:
		Src extends States_Keys<Base>
		?
		Dst extends States_Keys<Base>
		?
		Path[Src][Dst] extends true
		?
			never
		:
			Paths<Base, Path & { [ src in Src ]: { [ dst in Dst ]: true } }>
		:
			never
		:
			never,

	has
	<
		Src extends Key_Base,
		Dst extends Key_Base,
	>
	(src: Src, dst: Dst)
	:
		Path[Src][Dst] extends true ? true : false,
}


export type Paths_Pair = [ Key_Base, Key_Base ]
export type Paths_Seq  = Paths_Pair[]

export function Paths <Base extends States<any>> (base: Base, paths: Paths_Seq = []): Paths<Base, Paths_Map_Empty>
{
	const $ =
	{
		add,
		has
	}

	function add (src: Key_Base, dst: Key_Base)
	{
		if (! base.has(src)) throw new TypeError('wrong_src')
		if (! base.has(dst)) throw new TypeError('wrong_dst')
		if (has(src, dst))   throw new TypeError('path_taken_already')

		return Paths(base, [ ...paths, [ src, dst ] ])
	}

	function has (src: Key_Base, dst: Key_Base)
	{
		return (-1 !== paths.findIndex(([ s, d ]) => (src === s) && (dst === d)))
	}

	return ($ as any)
}

/*


export default function Schema (states, paths)
{
	function state (key, fn)
	{
		return Schema(states.add(key, fn), paths)
	}

	function path (src, dst)
	{
		return Schema(states, paths.add(key, fn))
	}
}
*/

const a: States_Map_Base = { a: () => 1 };
