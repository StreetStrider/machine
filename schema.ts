// eslint-disable max-len

export type Key_Base = string

export type Enter_Fn <Args extends unknown[], Target> = (...args: Args) => Target
export type Leave_Fn = () => void
export type State_Dscr <Args extends unknown[], Target> =
{
	enter:  Enter_Fn<Args, Target>,
	leave?: Leave_Fn,
}

export type States_Map_Base  = { [ key: Key_Base ]: State_Dscr<any[], any> }
export type States_Map_Empty = {}

export type States_Data <T> = T extends States<infer Map> ? Map : never
export type States_Keys <T> = T extends States<infer Map> ? keyof Map : never
export type States_Values <T extends States<any>> = ReturnType<States_Data<T>[ States_Keys<T> ]['enter']>

export type States <States_Map extends States_Map_Base> =
{
	add
	<
		Key extends Key_Base,
		Args extends unknown[],
		Target,
	>
	(key: Key, enter_fn: Enter_Fn<Args, Target>, leave_fn?: Leave_Fn)
	:
		Key extends keyof States_Map
		?
			never
		:
			States<States_Map & { [ key in Key ]: State_Dscr<Args, Target> }>,

	add
	<
		Key extends Key_Base,
	>
	(key: Key)
	:
		Key extends keyof States_Map
		?
			never
		:
			States<States_Map & { [ key in Key ]: State_Dscr<[], void> }>,

	keys ()
	: readonly (keyof States_Map)[],

	has <Key extends Key_Base> (key: Key)
	:
		Key extends keyof States_Map ? true : false,

	get <Key extends keyof States_Map> (key: Key)
	:
		States_Map[Key],

}

function Void () {}

export function States (states: States_Map_Base = Object.create(null)): States<States_Map_Empty>
{
	const $ =
	{
		add,
		keys,
		has,
		get,
	}

	function add (
		key: Key_Base,
		enter_fn?:  (...args: unknown[]) => unknown,
		leave_fn?: () => void
	)
	{
		if (has(key))
		{
			throw new TypeError('state_taken_already')
		}

		return States({ ...states, [ key ]:
		{
			enter: (enter_fn ?? Void),
			leave: leave_fn,
		}})
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
		if (! has(key)) throw new TypeError('state_missing')

		return states[key]
	}

	return ($ as any)
}


export type Paths_Item = { [ dst: Key_Base ]: true }
export type Paths_Map_Base = { [ src: Key_Base ]: Paths_Item }
export type Paths_Map_Empty = {}

export type Paths_Pair = [ Key_Base, Key_Base ]
export type Paths_Seq  = Paths_Pair[]

export type Paths_Base <P extends Paths<any, any>> = P extends Paths<infer Base, any> ? Base : never
export type Paths_Data <P extends Paths<any, any>> = P extends Paths<any,  infer Map> ? Map  : never

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

	keys ()
	: Paths_Seq[],

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


export function Paths <Base extends States<any>> (base: Base, paths: Paths_Seq = []): Paths<Base, Paths_Map_Empty>
{
	const $ =
	{
		add,
		keys,
		has,
		rebase,
	}

	function add (src: Key_Base, dst: Key_Base)
	{
		if (! base.has(src)) throw new TypeError('path_wrong_src')
		if (! base.has(dst)) throw new TypeError('path_wrong_dst')
		if (has(src, dst))   throw new TypeError('path_taken_already')

		return Paths(base, [ ...paths, [ src, dst ] ])
	}

	function keys ()
	{
		return paths
	}

	function has (src: Key_Base, dst: Key_Base)
	{
		return (-1 !== paths.findIndex(([ s, d ]) => (src === s) && (dst === d)))
	}

	function rebase (base_new: States<any>)
	{
		if (! based_on(base_new, base)) throw new TypeError('path_wrong_base')

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
		}

		return true
	}

	return ($ as any)
}


export type Schema_States <Sc extends Schema<any, any>> = Sc extends Schema<infer States, any> ? States : never
export type Schema_Paths  <Sc extends Schema<any, any>> = Sc extends Schema<any,  infer Paths> ? Paths  : never

export type Schema_Enter
<
	Sc extends Schema<any, any>,
	Key extends States_Keys<Schema_States<Sc>>,
>
=
	States_Data<Schema_States<Sc>>[Key]['enter']

export type Schema <S extends States<any>, P extends Paths<S, any>> =
{
	states: S,
	paths: P,

	state
	<
		Key extends Key_Base,
		Args extends unknown[],
		Target,
	>
	(key: Key, enter_fn: Enter_Fn<Args, Target>, leave_fn?: Leave_Fn)
	:
		Key extends States_Keys<S>
		?
			never
		:
			Schema<
				   States<States_Data<S> & { [ key in Key ]: State_Dscr<Args, Target> }>,
				Paths<
					States<States_Data<S> & { [ key in Key ]: State_Dscr<Args, Target> }>,
					Paths_Data<P>
				>
			>,

	state
	<
		Key extends Key_Base,
	>
	(key: Key)
	:
		Key extends States_Keys<S>
		?
			never
		:
			Schema<
				   States<States_Data<S> & { [ key in Key ]: State_Dscr<[], void> }>,
				Paths<
					States<States_Data<S> & { [ key in Key ]: State_Dscr<[], void> }>,
					Paths_Data<P>
				>
			>,

	path
	<
		Src extends States_Keys<S>,
		Dst extends States_Keys<S>,
	>
	(src: Src, dst: Dst)
	:
		Paths_Data<P>[Src][Dst] extends true
		?
			never
		:
			Schema<S, Paths<S, Paths_Data<P> & { [ src in Src ]: { [ dst in Dst ]: true } }>>,
}


export function Schema <S extends States<any>, P extends Paths<S, any>> (states: S = States() as any, paths: P = Paths(states) as any)
: Schema<States<States_Map_Empty>, Paths<States<States_Map_Empty>, Paths_Map_Empty>>
{
	const $ =
	{
		states,
		paths,
		state,
		path,
	}

	function state (key: Key_Base, enter_fn?: Enter_Fn<unknown[], unknown>, leave_fn?: Leave_Fn)
	{
		const states_new = states.add(key, (enter_fn as any), leave_fn)
		const paths_new  = paths.rebase(states_new)
		return Schema(states_new, paths_new)
	}

	function path (src: States_Keys<S>, dst: States_Keys<S>)
	{
		return Schema(states, paths.add(src, dst))
	}

	return ($ as any)
}
