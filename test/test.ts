// $ ExpectType X
// $ ExpectError

// import * as Machine from 'machine'

import { States } from 'machine'
import { Paths }  from 'machine'

const
s0 = States()
s0 // $ExpectType States<States_Map_Empty>

s0.has('a') // $ExpectType false
s0.has('b') // $ExpectType false
s0.has('c') // $ExpectType false

s0.get('a') // $ExpectError
s0.get('b') // $ExpectError
s0.get('c') // $ExpectError

const
s_a = s0.add('a', () => 1)
s_a // $ExpectType States<{ a: () => number; }>

s_a.has('a') // $ExpectType true
s_a.has('b') // $ExpectType false
s_a.has('c') // $ExpectType false

s_a.get('a') // $ExpectType () => number
s_a.get('b') // $ExpectError
s_a.get('c') // $ExpectError

const
s_a_E = s_a.add('a', () => false)
s_a_E // $ExpectType never

const
s_b = s_a.add('b', (b: number) => String(b))
s_b // $ExpectType States<{ a: () => number; } & { b: (b: number) => string; }>

s_b.has('a') // $ExpectType true
s_b.has('b') // $ExpectType true
s_b.has('c') // $ExpectType false

s_b.get('a') // $ExpectType () => number
s_b.get('b') // $ExpectType (b: number) => string
s_b.get('c') // $ExpectError

const
s_c = s_b.add('c', (c: string) => Boolean(c))

const
p0 = Paths(s_b)
p0 // $ExpectType Paths<States<{ a: () => number; } & { b: (b: number) => string; }>, Paths_Map_Empty>

const
p_ab = p0.add('a', 'b')
p_ab // $ExpectType Paths<States<{ a: () => number; } & { b: (b: number) => string; }>, { a: { b: true; }; }>

const
p_e1 = p0.add('a', 'c') // $ExpectError

const
p_e2 = p0.add('c', 'b') // $ExpectError

const
p_ab_ba = p_ab.add('b', 'a')
p_ab_ba // $ExpectType Paths<States<{ a: () => number; } & { b: (b: number) => string; }>, { a: { b: true; }; } & { b: { a: true; }; }>

const
p_ab_ba_ac_ca = Paths(s_c)
.add('a', 'b')
.add('b', 'a')
.add('a', 'c')
.add('c', 'a')
p_ab_ba_ac_ca // $ExpectType Paths<States<{ a: () => number; } & { b: (b: number) => string; } & { c: (c: string) => boolean; }>, { a: { b: true; }; } & { b: { a: true; }; } & { a: { c: true; }; } & { c: { a: true; }; }>
