import { AnyAction, ActionCreatorBuilder, TypeConstant } from './types';
import { action } from './action';
import { Store, Action, Dispatch } from 'redux';

export interface ActionCreatorFactoryOptions<TState> {
	/**
	 * This is for tracking all type constants.
	 * When you build a new action creator, its type will be saved into this array.
	 * You will get an error if you try to register a type constant twice.
	 */
	types: TypeConstant[];
	store: Store<TState, AnyAction>;
}

export function actionCreatorFactory<TState>({
	types,
	store
}: ActionCreatorFactoryOptions<TState>): ActionCreatorBuilder<TState> {
	const actionCreatorBuilder: ActionCreatorBuilder<TState> = <
		TType extends string,
		TArg,
		TPayload
	>(
		type: TType,
		payloadHandler?: (a?: TArg, d?: Dispatch, g?: () => TState) => TPayload
	) => {
		if (types.indexOf(type) !== -1) {
			throw new Error(
				`Cannot create action creator with duplicate type "${type}"`
			);
		}
		types.push(type);
		const actionCreator = (a?: TArg) => {
			return action(
				type,
				payloadHandler
					? payloadHandler(a, store.dispatch, store.getState)
					: undefined,
				undefined
			);
		};
		Object.assign(actionCreator, { toString: () => type });
		return actionCreator;
	};
	return actionCreatorBuilder;
}
