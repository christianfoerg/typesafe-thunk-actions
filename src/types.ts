import { AnyAction, Reducer } from 'redux';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';

export type TypeConstant = string;

export interface PayloadHandler<TState, TArg, TPayload> {
	(
		arg?: TArg,
		dispatch?: ThunkDispatch<TState, undefined, AnyAction>,
		getState?: () => TState
	): TPayload;
}

export interface ActionCreatorBuilder<TState> {
	<TType extends string, TArg, TPayload>(
		type: TType,
		payloadHandler?: PayloadHandler<TState, TArg, TPayload>
	): ActionCreator<TType, TArg, TState, TPayload>;
}

export type ActionCreator<TType extends string, TArg, TState, TPayload> = (
	a?: TArg
) => (
	d: ThunkDispatch<TState, undefined, AnyAction>,
	g: () => TState
) => PayloadMetaAction<TType, TPayload, undefined>;

export type ActionPayload<
	TActionCreator
> = TActionCreator extends ActionCreator<
	infer TType,
	infer TAarg,
	infer TState,
	infer TPayload
>
	? TPayload
	: never;

export type GetAction<TActionCreator> = TActionCreator extends ActionCreator<
	infer TType,
	infer TArg,
	infer TState,
	infer TPayload
>
	? { type: TType; payload: TPayload }
	: never;

export { Reducer, AnyAction };
export { ThunkDispatch } from 'redux-thunk';

export interface EmptyAction<TType extends string> {
	type: TType;
}
export interface PayloadAction<TType extends string, TPayload> {
	type: TType;
	payload: TPayload;
}
export interface PayloadMetaAction<TType extends string, TPayload, TMeta> {
	type: TType;
	payload: TPayload;
	meta: TMeta;
}
export type StandardAction<
	TType extends string,
	TPayload = undefined,
	TMeta = undefined
> = TMeta extends undefined
	? TPayload extends undefined
		? unknown extends TPayload
			? PayloadAction<TType, TPayload>
			: unknown extends TMeta
			? PayloadMetaAction<TType, TPayload, TMeta>
			: EmptyAction<TType>
		: PayloadAction<TType, TPayload>
	: PayloadMetaAction<TType, TPayload, TMeta>;

export type EmptyActionCreator<TType extends string> = (
	type: TType
) => EmptyAction<TType>;
export type PayloadActionCreator<TType extends string, TPayload> = (
	type: TType,
	payload: TPayload
) => PayloadAction<TType, TPayload>;
export type PayloadMetaActionCreator<TType extends string, TPayload, TMeta> = (
	type: TType,
	payload: TPayload,
	meta: TMeta
) => PayloadMetaAction<TType, TPayload, TMeta>;

export type ActionCreatorConstructor<
	TType extends string,
	TPayload extends any = undefined,
	TMeta extends any = undefined
> = [TMeta] extends [undefined]
	? [TPayload] extends [undefined]
		? unknown extends TPayload
			? PayloadActionCreator<TType, TPayload>
			: unknown extends TMeta
			? PayloadMetaActionCreator<TType, TPayload, TMeta>
			: EmptyActionCreator<TType>
		: PayloadActionCreator<TType, TPayload>
	: PayloadMetaActionCreator<TType, TPayload, TMeta>;
