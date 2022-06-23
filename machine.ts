
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

	keys (): Key_Base[],

	has <Key extends Key_Base> (key: Key)
	:
		Key extends keyof States_Map ? true : false,

	get <Key extends keyof States_Map> (key: Key)
	:
		States_Map[Key],

}

export function States (states: States_Map_Base = Object.create(null)): States<States_Map_Empty>
{
	const $ =
	{
		add,
		keys,
		has,
		get,
	}

	function add (key: Key_Base, fn: (...args: unknown[]) => unknown)
	{
		if (has(key))
		{
			throw new TypeError('state_taken_already')
		}

		return States({ ...states, [ key ]: fn })
	}

	function keys ()
	{
		return Object.keys(states)
	}

	function has (key: Key_Base)
	{
		return (key in states)
	}

	function get (key: Key_Base)
	{
		if (! has(key)) throw new TypeError('wrong_key')

		return states[key]
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
		Src extends States_Keys<Base>,
		Dst extends States_Keys<Base>,
	>
	(src: Src, dst: Dst)
	:
		Path[Src][Dst] extends true
		?
			never
		:
			Paths<Base, Path & { [ src in Src ]: { [ dst in Dst ]: true } }>,

	has
	<
		Src extends Key_Base,
		Dst extends Key_Base,
	>
	(src: Src, dst: Dst)
	:
		Path[Src][Dst] extends true ? true : false,

	rebase <Base_New extends States<any>> (base: Base_New)
	:
		Base extends Base_New
		?
			Paths<Base_New, Path>
		:
			never,

}


export type Paths_Pair = [ Key_Base, Key_Base ]
export type Paths_Seq  = Paths_Pair[]

export function Paths <Base extends States<any>> (base: Base, paths: Paths_Seq = []): Paths<Base, Paths_Map_Empty>
{
	const $ =
	{
		add,
		has,
		rebase,
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

	function rebase (base_new: States<any>)
	{
		if (! based_on(base_new, base)) throw new TypeError('wrong_base')

		return Paths(base_new, paths)
	}

	function based_on (base_new: States<any>, base: States<any>)
	{
		for (var key of base.keys())
		{
			try
			{
				if (base_new.get(key) !== base.get(key)) return false
			}
			catch (e)
			{
				return false
			}

			return true
		}
	}

	return ($ as any)
}


type Schema <S extends States<any>, P extends Paths<S, any>> =
{
	/*
	state

	()

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
			*/

	// state (...args: Parameters<S['add']>): Schema<>
}


export default function Schema <S extends States<any>, P extends Paths<S, any>> (states: S, paths: P)
: Schema<States<States_Map_Empty>, Paths<States<States_Map_Empty>, Paths_Map_Empty>>
{
	const $ = {}

	/*
	function state (key: Key_Base, fn: (...args: unknown[]) => unknown)
	{
		return Schema(states.add(key, fn), paths)
	}

	function path (src: Key_Base, dst: Key_Base)
	{
		return Schema(states, paths.add(key, fn))
	}
	*/

	return ($ as any)
}
