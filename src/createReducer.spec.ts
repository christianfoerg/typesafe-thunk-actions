import { combineReducers } from 'redux';
import { createReducer } from './createReducer';
import mockStoreFactory, { MockStoreEnhanced } from 'redux-mock-store';
import { buildStore } from './utils/testing';
import { createStandardAction } from 'typesafe-actions';

interface State {
	amount: number;
	text: string;
}

describe('createReducer', () => {
	const makeMockStore = mockStoreFactory<State>();
	let mockStore: MockStoreEnhanced<State>;
	beforeEach(() => {
		mockStore = makeMockStore({ amount: 0, text: '' });
	});
	it('should return the initial state', () => {
		const reducer = createReducer(0);
		expect(reducer(0, { type: 'any' })).toEqual(0);
	});
	it('should handle registered actions', () => {
		const add = createStandardAction('add')<number>();
		const subtract = createStandardAction('subtract')<number>();
		const multiply = createStandardAction('multiply')<number>();
		const reducer = createReducer(2)
			.handleAction(add, (state, action) => state + action.payload)
			.handleAction(subtract, (state, action) => state - action.payload)
			.handleAnyAction('divide', (state, action) => state / action.payload);
		expect(reducer(2, add(3))).toEqual(5);
		expect(reducer(2, subtract(3))).toEqual(-1);
		expect(reducer(2, multiply(3))).toEqual(2);
		expect(reducer(3, { type: 'divide', payload: 2 })).toEqual(1.5);
	});
	it('should work with real store', () => {
		const add = createStandardAction('add')<number>();
		const write = (text: string) => ({
			type: 'write',
			payload: text
		});
		const amountReducer = createReducer(0).handleAction(
			add,
			(s, a) => s + a.payload
		);
		const rootReducer = combineReducers<State>({
			amount: amountReducer,
			text: (state = '', action) => {
				switch (action.type) {
					case 'write':
						return state + action.payload;
					default:
						return state;
				}
			}
		});
		const store = buildStore(rootReducer);
		store.dispatch(add(1));
		expect(store.getState()).toEqual({
			amount: 1,
			text: ''
		});
		store.dispatch(write('a'));
		expect(store.getState()).toEqual({
			amount: 1,
			text: 'a'
		});
		store.dispatch(add(4));
		expect(store.getState()).toEqual({
			amount: 5,
			text: 'a'
		});
	});
	it('should throw an error when trying to re-register an action creator', done => {
		const add = createStandardAction('add')<number>();
		const subtract = createStandardAction('subtract')<number>();
		try {
			createReducer(0)
				.handleAction(add, (state, action) => state + action.payload)
				.handleAction(subtract, (state, action) => state - action.payload)
				.handleAction(add, (state, action) => state + action.payload);
			done(new Error('Did not throw an error'));
		} catch (err) {
			expect(err.message).toEqual(
				'Cannot handle action type "add" more than once'
			);
			done();
		}
	});
	it('should throw an error when trying to re-register a type', done => {
		const add = createStandardAction('add')<number>();
		const subtract = createStandardAction('subtract')<number>();
		try {
			createReducer(0)
				.handleAction(add, (state, action) => state + action.payload)
				.handleAction(subtract, (state, action) => state - action.payload)
				.handleAnyAction('add', (state, action) => state + action.payload);
			done(new Error('Did not throw an error'));
		} catch (err) {
			expect(err.message).toEqual('Cannot handle type "add" more than once');
			done();
		}
	});
});
