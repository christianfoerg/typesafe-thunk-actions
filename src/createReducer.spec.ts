import { createReducer } from './createReducer';
import { actionCreatorFactory } from './actionCreatorFactory';
import { combineReducers } from 'redux';
import mockStoreFactory, { MockStoreEnhanced } from 'redux-mock-store';
import { ActionCreatorBuilder } from './types';
import { buildStore } from './utils/testing';

interface State {
	amount: number;
	text: string;
}

describe('createReducer', () => {
	const makeMockStore = mockStoreFactory<State>();
	let mockStore: MockStoreEnhanced<State>;
	let buildActionCreator: ActionCreatorBuilder<State>;
	beforeEach(() => {
		mockStore = makeMockStore({ amount: 0, text: '' });
		buildActionCreator = actionCreatorFactory<State>({
			types: [],
			store: mockStore
		});
	});
	it('should return the initial state', () => {
		const reducer = createReducer(0);
		expect(reducer(0, { type: 'any' })).toEqual(0);
	});
	it('should handle registered actions', () => {
		const add = buildActionCreator('add', (a: number) => a);
		const subtract = buildActionCreator('subtract', (a: number) => a);
		const multiply = buildActionCreator('multiply', (a: number) => a);
		const reducer = createReducer(2)
			.handleAction(add, (state, action) => state + action.payload)
			.handleAction(subtract, (state, action) => state - action.payload);
		expect(reducer(2, add(3))).toEqual(5);
		expect(reducer(2, subtract(3))).toEqual(-1);
		expect(reducer(2, multiply(3))).toEqual(2);
	});
	it('should work with real store', () => {
		const add = buildActionCreator('add', (a: number) => a);
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
	it('should throw an error when trying to re-register an action', done => {
		const add = buildActionCreator('add', (a: number) => a);
		const subtract = buildActionCreator('subtract', (a: number) => a);
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
});
