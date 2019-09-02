import { applyMiddleware, createStore, AnyAction, Reducer } from 'redux';
import createSagaMiddleware from 'redux-saga';

export const sagaMiddleware = createSagaMiddleware();

export async function wait(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(() => resolve(), ms);
	});
}

export function buildStore<TState>(rootReducer: Reducer<TState, AnyAction>) {
	const createStoreWithMiddleware = applyMiddleware(sagaMiddleware)(
		createStore
	);
	return createStoreWithMiddleware<TState>(rootReducer);
}
