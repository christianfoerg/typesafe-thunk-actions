import { applyMiddleware, createStore, AnyAction, Reducer } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

export const sagaMiddleware = createSagaMiddleware();

export async function wait(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(() => resolve(), ms);
	});
}

export function buildStore<TState>(rootReducer: Reducer<TState, AnyAction>) {
	const createStoreWithMiddleware = applyMiddleware<
		ThunkDispatch<TState, undefined, AnyAction>
	>(thunk, sagaMiddleware)(createStore);
	return createStoreWithMiddleware<TState>(rootReducer);
}
