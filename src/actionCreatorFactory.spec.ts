import { actionCreatorFactory } from './actionCreatorFactory';
import { buildStore } from './utils/testing';
import { combineReducers } from 'redux';

describe('actionCreatorFactory', () => {
	test('should throw an error if a type is created twice', done => {
		interface State {
			amount: number;
		}
		const rootReducer = combineReducers<State>({
			amount: (state = 0) => state
		});
		const store = buildStore(rootReducer);
		const buildActionCreator = actionCreatorFactory<State>({
			types: [],
			store
		});
		buildActionCreator('increase_amount', (a: number) => a);
		try {
			buildActionCreator('increase_amount', (a: number) => a);
			done(new Error('Did not throw an error'));
		} catch (err) {
			expect(err.message).toEqual(
				'Cannot create action creator with duplicate type "increase_amount"'
			);
			done();
		}
	});
});
