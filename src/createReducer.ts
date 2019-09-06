import { AnyAction, ActionCreator, GetAction, Reducer } from './types';

export function createReducer<TState>(
	initialState: TState,
	initialHandlers: {
		[key: string]: Reducer<TState, AnyAction>;
	} = {}
) {
	const handlers = { ...initialHandlers };
	const rootReducer: Reducer<TState, AnyAction> = (
		state = initialState,
		action: AnyAction
	) => {
		if (handlers.hasOwnProperty(action.type)) {
			const reducer = handlers[action.type];
			return reducer(state, action);
		} else {
			return state;
		}
	};
	function handleAction<TType extends string, TArg, TPayload>(
		actionCreator: ActionCreator<TType, TArg, any, TPayload>,
		reducer: (state: TState, action: GetAction<typeof actionCreator>) => TState
	) {
		if (initialHandlers.hasOwnProperty(String(actionCreator))) {
			throw new Error(
				`Cannot handle action type "${actionCreator}" more than once`
			);
		}
		const allHandlers = {
			...initialHandlers,
			[String(actionCreator)]: reducer
		};
		return createReducer(initialState, allHandlers);
	}
	function handleAnyAction(type: string, reducer: Reducer<TState, AnyAction>) {
		if (initialHandlers.hasOwnProperty(type)) {
			throw new Error(`Cannot handle type "${type}" more than once`);
		}
		const allHandlers = {
			...initialHandlers,
			[type]: reducer
		};
		return createReducer(initialState, allHandlers);
	}
	return Object.assign(rootReducer, {
		handleAction,
		handleAnyAction
	});
}
