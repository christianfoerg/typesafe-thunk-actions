import { applyMiddleware, createStore, AnyAction, Reducer } from 'redux';
import thunk from 'redux-thunk';

export async function wait(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(() => resolve(), ms);
	});
}

export function buildStore<TState>(rootReducer: Reducer<TState, AnyAction>) {
	const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
	return createStoreWithMiddleware<TState>(rootReducer);
}
