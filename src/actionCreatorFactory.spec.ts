import { actionCreatorFactory } from './actionCreatorFactory';

describe('actionCreatorFactory', () => {
	test('should throw an error if a type is created twice', done => {
		interface State {
			amount: number;
		}
		const buildActionCreator = actionCreatorFactory<State>();
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
