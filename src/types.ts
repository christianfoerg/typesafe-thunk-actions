import { AnyAction, Reducer, Dispatch } from 'redux';

export type TypeConstant = string;

export interface PayloadHandler<TState, TArg, TPayload> {
	(arg?: TArg, dispatch?: Dispatch, getState?: () => TState): TPayload;
}

export interface ActionCreatorBuilder<TState> {
	<TType extends string, TArg, TPayload>(
		type: TType,
		payloadHandler?: PayloadHandler<TState, TArg, TPayload>
	): ActionCreator<TType, TArg, TState, TPayload>;
}

export type ActionCreator<TType extends string, TArg, TState, TPayload> = (
	a?: TArg
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

export interface PayloadMetaAction<TType extends string, TPayload, TMeta> {
	type: TType;
	payload: TPayload;
	meta: TMeta;
}
