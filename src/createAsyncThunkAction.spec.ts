import { createAsyncThunkAction } from './createAsyncThunkAction';
import mockStoreFactory, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { wait } from './utils/testing';
import { AnyAction } from 'redux';
import { createStandardAction } from 'typesafe-actions';
import { ThunkDispatch } from 'redux-thunk';

interface State {
	amount: number;
	text: string;
}

describe('asyncActionCreatorFactory', () => {
	const makeMockStore = mockStoreFactory<State>([thunk]);
	let mockStore: MockStoreEnhanced<State>;
	let dispatch: ThunkDispatch<State, undefined, AnyAction>;
	let getState: () => State;
	beforeEach(() => {
		mockStore = makeMockStore({ amount: 0, text: '' });
		dispatch = mockStore.dispatch;
		getState = mockStore.getState;
	});
	test('should throw error when trying to stringify async action creator', async done => {
		const asyncActionCreator = createAsyncThunkAction(
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
	test('should contain request, success and failure action creators', () => {
		const asyncActionCreator = createAsyncThunkAction('async_fn', () =>
			wait(50)
		);
		expect(asyncActionCreator.request).toBeDefined();
		expect(asyncActionCreator.success).toBeDefined();
		expect(asyncActionCreator.failure).toBeDefined();
		expect(dispatch(asyncActionCreator.request())).toEqual({
			type: 'async_fn.request'
		});
		expect(dispatch(asyncActionCreator.success(null))).toEqual({
			type: 'async_fn.success',
			payload: null
		});
		expect(dispatch(asyncActionCreator.failure(new Error()))).toEqual({
			type: 'async_fn.failure',
			payload: new Error()
		});
	});
	test('should dispatch pending and fulfilled actions', async () => {
		const promiseFn = async () => {
			wait(3);
			return 5;
		};
		const asyncActionCreator = createAsyncThunkAction('increase', promiseFn);
		dispatch(asyncActionCreator());
		await wait(500);
		const dispatchedActions = mockStore.getActions();
		expect(dispatchedActions).toEqual([
			{ type: asyncActionCreator.request.toString() },
			{ type: asyncActionCreator.success.toString(), payload: 5 }
		]);
	});
	test('should dispatch pending and rejected actions', async () => {
		const error = new Error('Always throwing');
		const promiseFn = async () => {
			throw error;
		};
		const asyncActionCreator = createAsyncThunkAction('throw', promiseFn);
		dispatch(asyncActionCreator());
		await wait(500);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.request.toString() },
			{ type: asyncActionCreator.failure.toString(), payload: error }
		]);
	});
	test('should dispatch another action via thunk', async () => {
		const actionCreator = createStandardAction('add')<number>();
		const asyncActionCreator = createAsyncThunkAction(
			'get_amount',
			async (a: number, d, g) => {
				const { amount } = g();
				dispatch(actionCreator(amount));
				await wait(500);
				return a;
			}
		);
		dispatch(asyncActionCreator(5));
		await wait(1000);
		expect(mockStore.getActions()).toEqual([
			{ type: asyncActionCreator.request.toString() },
			{ type: actionCreator.toString(), payload: 0 },
			{ type: asyncActionCreator.success.toString(), payload: 5 }
		]);
	});
});
