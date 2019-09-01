import { TypeConstant } from './types';

export function action<T extends TypeConstant, E>(
	type: T,
	payload: undefined,
	meta: undefined,
	error: E
): { type: T; error: E };

export function action<T extends TypeConstant, M, E>(
	type: T,
	payload: undefined,
	meta: M,
	error: E
): { type: T; meta: M; error: E };

export function action<T extends TypeConstant, P, E>(
	type: T,
	payload: P,
	meta: undefined,
	error: E
): { type: T; payload: P; error: E };

export function action<T extends TypeConstant, P, M, E>(
	type: T,
	payload: P,
	meta: M,
	error: E
): { type: T; payload: P; meta: M; error: E };

export function action<T extends TypeConstant, M>(
	type: T,
	payload: undefined,
	meta: M
): { type: T; meta: M };

export function action<T extends TypeConstant, P, M>(
	type: T,
	payload: P,
	meta: M
): { type: T; payload: P; meta: M };

export function action<T extends TypeConstant, P>(
	type: T,
	payload: P
): { type: T; payload: P };

export function action<T extends TypeConstant>(type: T): { type: T };

export function action<
	T extends TypeConstant,
	P = undefined,
	M = undefined,
	E = undefined
>(type: T, payload?: P, meta?: M, error?: E) {
	if (!type) {
		throw new Error('Empty type is not allowed');
	}
	return { type, payload, meta, error } as any;
}
