import { asyncActionCreatorFactory } from './asyncActionCreatorFactory';
import { actionCreatorFactory } from './actionCreatorFactory';
import thunk, { ThunkDispatch } from 'redux-thunk';
import mockStoreFactory, { MockStoreEnhanced } from 'redux-mock-store';
import { ActionCreatorBuilder, AnyAction } from './types';
import { wait } from './utils';

interface State {
	amount: number;
	text: string;
}

describe('asyncActionCreatorFactory', () => {
	const makeMockStore = mockStoreFactory<State>([thunk]);
	let mockStore: MockStoreEnhanced<State>;
	let dispatch: ThunkDispatch<State, undefined, AnyAction>;
	let getState: () => State;
	let buildActionCreator: ActionCreatorBuilder<State>;
	beforeEach(() => {
		mockStore = makeMockStore({ amount: 0, text: '' });
		dispatch = mockStore.dispatch;
		getState = mockStore.getState;
		buildActionCreator = actionCreatorFactory<State>();
	});
	test('should throw error when trying to stringify async action creator', async done => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator
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
		expect(dispatch(asyncActionCreator.pending())).toEqual({
			type: 'async_fn.PENDING'
		});
		expect(dispatch(asyncActionCreator.rejected())).toEqual({
			type: 'async_fn.REJECTED'
		});
		expect(dispatch(asyncActionCreator.fulfilled())).toEqual({
			type: 'async_fn.FULFILLED'
		});
	});
	test('should dispatch pending and fulfilled actions', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator
		});
		const promiseFn = async () => {
			wait(3);
			return 5;
		};
		const asyncActionCreator = buildAsyncActionCreator('increase', promiseFn);
		const asyncAction = await dispatch(asyncActionCreator());
		expect(asyncAction).toEqual({
			type: 'increase_fulfilled',
			payload: 5
		});
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString() },
			{ type: asyncActionCreator.fulfilled.toString(), payload: 5 }
		]);
	});
	test('should dispatch pending and rejected actions', async () => {
		const buildAsyncActionCreator = asyncActionCreatorFactory<State>({
			buildActionCreator
		});
		const error = new Error('Always throwing');
		const promiseFn = async () => {
			throw error;
		};
		const asyncActionCreator = buildAsyncActionCreator('throw', promiseFn);
		await dispatch(asyncActionCreator());
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.pending.toString() },
			{ type: asyncActionCreator.rejected.toString(), payload: error }
		]);
	});
});
