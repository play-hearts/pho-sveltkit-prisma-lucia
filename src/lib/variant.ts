import { Variant } from '@prisma/client'
import { error } from '@sveltejs/kit'

export function asVariant(v: string): Variant {
	v = v.toUpperCase()
	if (v in Variant) return v as Variant
	else throw error(500, `No such variant: ${v}`)
}
