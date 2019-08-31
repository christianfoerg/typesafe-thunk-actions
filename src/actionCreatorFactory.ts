import {
	AnyAction,
	ThunkDispatch,
	ActionCreator,
	ActionCreatorBuilder
} from './types';
import { action } from './action';

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
	) => {
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
			return d(
				action(
					type,
					payloadHandler ? payloadHandler(a, d, g) : undefined,
					undefined
				)
			);
		};
		Object.assign(actionCreator, { toString: () => type });
		return actionCreator;
	};
	return actionCreatorBuilder;
}
