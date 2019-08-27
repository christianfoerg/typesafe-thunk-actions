import {
	AnyAction,
	ThunkDispatch,
	ActionCreator,
	ActionCreatorBuilder
} from './types';

export function actionCreatorFactory<TState>(): ActionCreatorBuilder<TState> {
	const types: string[] = [];
	const actionCreatorBuilder: ActionCreatorBuilder<TState> = <
		TType extends string,
		TArg,
		TPayload
	>(
		type: TType,
		payloadHandler?: (
			a?: TArg,
			d?: ThunkDispatch<TState, undefined, AnyAction>,
			g?: () => TState
		) => TPayload
	): ActionCreator<TType, TArg, TState, TPayload> => {
		if (types.indexOf(type) !== -1) {
			throw new Error(
				`Cannot create action creator with duplicate type "${type}"`
			);
		}
		types.push(type);
		const actionCreator = (a?: TArg) => (
			d: ThunkDispatch<TState, undefined, AnyAction>,
			g: () => TState
		) => {
			const action = {
				type,
				payload: payloadHandler ? payloadHandler(a, d, g) : undefined
			};
			return d(action);
		};
		Object.assign(actionCreator, { toString: () => type });
		return actionCreator;
	};
	return actionCreatorBuilder;
}
