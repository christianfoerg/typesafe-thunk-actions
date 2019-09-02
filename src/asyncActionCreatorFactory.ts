import { AnyAction, ActionCreatorBuilder, TypeConstant } from './types';
import { SagaMiddleware } from 'redux-saga';
import {
	put,
	delay,
	takeLatest,
	takeEvery,
	throttle
} from 'redux-saga/effects';
import { Store, Dispatch } from 'redux';

interface RequestActionCreatorFactoryOptions<TState> {
	buildActionCreator: ActionCreatorBuilder<TState>;
	store: Store<TState>;
	sagaMiddleware: SagaMiddleware<any>;
	suffix?: AsyncTypeSuffix;
}
interface AsyncTypeSuffix {
	pending: string;
	rejected: string;
	fulfilled: string;
}

const defaultSuffix: AsyncTypeSuffix = {
	pending: '_pending',
	rejected: '_rejected',
	fulfilled: '_fulfilled'
};

interface AsyncActionRecipe {
	recipe: 'throttle' | 'debounce';
	ms: number;
}

export function asyncActionCreatorFactory<TState>(
	initialOptions: RequestActionCreatorFactoryOptions<TState>
) {
	return function createAsyncAction<TPayload, TArg = void>(
		type: string,
		promiseHandler: (
			arg: TArg,
			dispatch?: Dispatch,
			getState?: () => TState
		) => Promise<TPayload>,
		options?: AsyncActionRecipe
	) {
		const { buildActionCreator, sagaMiddleware, store } = initialOptions;
		const dispatch = store.dispatch;
		const suffix = initialOptions.suffix || defaultSuffix;
		const pendingType = `${type}${suffix.pending}`;
		const rejectedType = `${type}${suffix.rejected}`;
		const fulfilledType = `${type}${suffix.fulfilled}`;
		const pendingActionCreator = createActionCreator(
			pendingType,
			(arg: TArg) => arg
		);
		const rejectedActionCreator = createActionCreator(
			rejectedType,
			(err: any) => err
		);
		const fulfilledActionCreator = createActionCreator(
			fulfilledType,
			(payload: TPayload) => payload
		);

		if (options && options.recipe === 'debounce') {
			function* handlePromise(action: ReturnType<typeof pendingActionCreator>) {
				yield delay(options.ms);
				try {
					const payload: TPayload = yield promiseHandler(
						action.payload,
						dispatch,
						store.getState
					);
					yield put(fulfilledActionCreator(payload));
				} catch (err) {
					yield put(rejectedActionCreator(err));
				}
			}
			function* saga() {
				yield takeLatest(pendingType, handlePromise);
			}
			sagaMiddleware.run(saga);
		} else if (options && options.recipe === 'throttle') {
			function* handlePromise(action: ReturnType<typeof pendingActionCreator>) {
				try {
					const payload: TPayload = yield promiseHandler(
						action.payload,
						dispatch,
						store.getState
					);
					yield put(fulfilledActionCreator(payload));
				} catch (err) {
					yield put(rejectedActionCreator(err));
				}
			}
			function* saga() {
				yield throttle(options.ms, pendingType, handlePromise);
			}
			sagaMiddleware.run(saga);
		} else {
			function* handlePromise(action: ReturnType<typeof pendingActionCreator>) {
				try {
					const payload: TPayload = yield promiseHandler(
						action.payload,
						dispatch,
						store.getState
					);
					yield put(fulfilledActionCreator(payload));
				} catch (err) {
					yield put(rejectedActionCreator(err));
				}
			}
			function* saga() {
				yield takeEvery(pendingType, handlePromise);
			}
			sagaMiddleware.run(saga);
		}
		const actionCreator = (arg: TArg) => pendingActionCreator(arg);
		return Object.assign(actionCreator, {
			pending: pendingActionCreator,
			rejected: rejectedActionCreator,
			fulfilled: fulfilledActionCreator,
			toString: () => {
				throw new Error(
					'Forbidden to stringify an async action creator. Use the subordinate action creators instead.'
				);
			}
		});
	};
}

function createActionCreator<TType extends TypeConstant, TPayload>(
	type: TType,
	payloadHandler: (...args: any[]) => TPayload
) {
	const actionCreator = (...args: any[]) => ({
		type,
		payload: payloadHandler(...args)
	});
	return Object.assign(actionCreator, {
		toString: () => type
	});
}
