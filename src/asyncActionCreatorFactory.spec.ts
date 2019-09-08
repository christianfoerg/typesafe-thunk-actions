import { asyncActionCreatorFactory } from './asyncActionCreatorFactory';
import { actionCreatorFactory } from './actionCreatorFactory';
import mockStoreFactory, { MockStoreEnhanced } from 'redux-mock-store';
import { ActionCreatorBuilder } from './types';
import { wait, sagaMiddleware } from './utils/testing';
import { Dispatch } from 'redux';

interface State {
	amount: number;
	text: string;
}

describe('asyncActionCreatorFactory', () => {
	const makeMockStore = mockStoreFactory<State>([sagaMiddleware]);
	let mockStore: MockStoreEnhanced<State>;
	let dispatch: Dispatch;
	let getState: () => State;
	let buildActionCreator: ActionCreatorBuilder<State>;
	beforeEach(() => {
		mockStore = makeMockStore({ amount: 0, text: '' });
		dispatch = mockStore.dispatch;
		getState = mockStore.getState;
		buildActionCreator = actionCreatorFactory<State>({
			types: [],
			store: mockStore
		});
	});
	test('should throw error when trying to stringify async action creator', async done => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore
		});
		const asyncActionCreator = buildAsyncActionCreator(
			'async_number',
			async () => wait(40)
		);
		try {
			String(asyncActionCreator);
			done(
				new Error('Stringifying an async action creator did not throw an error')
			);
		} catch (err) {
			expect(err.message).toBe(
				'Forbidden to stringify an async action creator. Use the subordinate action creators instead.'
			);
			done();
		}
	});
	test('should contain pending, rejected and fulfilled action creators', () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore,
			suffix: {
				pending: '.PENDING',
				rejected: '.REJECTED',
				fulfilled: '.FULFILLED'
			}
		});
		const asyncActionCreator = buildAsyncActionCreator('async_fn', () =>
			wait(50)
		);
		expect(asyncActionCreator.pending).toBeDefined();
		expect(asyncActionCreator.rejected).toBeDefined();
		expect(asyncActionCreator.fulfilled).toBeDefined();
		expect(dispatch(asyncActionCreator.pending(null))).toEqual({
			type: 'async_fn.PENDING',
			payload: null
		});
		expect(dispatch(asyncActionCreator.rejected(new Error()))).toEqual({
			type: 'async_fn.REJECTED',
			payload: new Error()
		});
		expect(dispatch(asyncActionCreator.fulfilled(null))).toEqual({
			type: 'async_fn.FULFILLED',
			payload: null
		});
	});
	test('should dispatch pending and fulfilled actions', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore
		});
		const promiseFn = async () => {
			wait(3);
			return 5;
		};
		const asyncActionCreator = buildAsyncActionCreator('increase', promiseFn);
		dispatch(asyncActionCreator(null));
		await wait(50);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString(), payload: null },
			{ type: asyncActionCreator.fulfilled.toString(), payload: 5 }
		]);
	});
	test('should dispatch pending and rejected actions', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore
		});
		const error = new Error('Always throwing');
		const promiseFn = async () => {
			throw error;
		};
		const asyncActionCreator = buildAsyncActionCreator('throw', promiseFn);
		dispatch(asyncActionCreator(null));
		await wait(50);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString(), payload: null },
			{ type: asyncActionCreator.rejected.toString(), payload: error }
		]);
	});
	test('should dispatch another action via thunk', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore
		});
		const actionCreator = buildActionCreator('add', (a: number) => a);
		const asyncActionCreator = buildAsyncActionCreator(
			'get_amount',
			async (a: number, d, g) => {
				const { amount } = g();
				dispatch(actionCreator(amount));
				await wait(50);
				return a;
			}
		);
		dispatch(asyncActionCreator(5));
		await wait(100);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString(), payload: 5 },
			{ type: actionCreator.toString(), payload: 0 },
			{ type: asyncActionCreator.fulfilled.toString(), payload: 5 }
		]);
	});
	test('should only dispatch last fulfilled async action when debounced', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore
		});
		const asyncActionCreator = buildAsyncActionCreator(
			'wait',
			async (a: number) => {
				await wait(25);
				return a;
			},
			{ recipe: 'debounce', ms: 25 }
		);
		dispatch(asyncActionCreator(50));
		await wait(5);
		dispatch(asyncActionCreator(100));
		await wait(15);
		dispatch(asyncActionCreator(200));
		await wait(100);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString(), payload: 50 },
			{ type: asyncActionCreator.pending.toString(), payload: 100 },
			{ type: asyncActionCreator.pending.toString(), payload: 200 },
			{ type: asyncActionCreator.fulfilled.toString(), payload: 200 }
		]);
	});
	test('should not dispatch each fulfilled async action when throttled', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator,
			sagaMiddleware,
			store: mockStore
		});
		const asyncActionCreator = buildAsyncActionCreator(
			'wait',
			async (a: string) => {
				await wait(250);
				return a;
			},
			{ recipe: 'throttle', ms: 250 }
		);
		dispatch(asyncActionCreator('a'));
		await wait(50);
		dispatch(asyncActionCreator('b'));
		await wait(50);
		dispatch(asyncActionCreator('c'));
		await wait(50);
		dispatch(asyncActionCreator('d'));
		await wait(500);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString(), payload: 'a' },
			{ type: asyncActionCreator.pending.toString(), payload: 'b' },
			{ type: asyncActionCreator.pending.toString(), payload: 'c' },
			{ type: asyncActionCreator.pending.toString(), payload: 'd' },
			{ type: asyncActionCreator.fulfilled.toString(), payload: 'a' },
			{ type: asyncActionCreator.fulfilled.toString(), payload: 'd' }
		]);
	});
});
