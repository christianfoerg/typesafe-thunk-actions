export interface GetState<TState> {
	(): TState;
}

export interface Action<T = any> {
	type: T;
}

export interface AnyAction extends Action {
	[extraProps: string]: any;
}

export type Reducer<TState, TAction extends Action> = (
	state: TState | undefined,
	action: TAction
) => TState;

export interface Dispatch<A extends Action = AnyAction> {
	<T extends A>(action: T): T;
}

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
) => StandardAction<TType, TPayload>;

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
	? StandardAction<TType, TPayload>
	: never;

export interface StandardAction<TType extends string, TPayload> {
	type: TType;
	payload: TPayload;
}
