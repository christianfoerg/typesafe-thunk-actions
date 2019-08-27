import { AnyAction, ThunkDispatch, ActionCreatorBuilder } from './types';

interface RequestActionCreatorFactoryOptions<TState> {
	buildActionCreator: ActionCreatorBuilder<TState>;
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

export function asyncActionCreatorFactory<TState>(
	initialOptions: RequestActionCreatorFactoryOptions<TState>
) {
	return function createAsyncAction<TPayload>(
		type: string,
		promise: () => Promise<TPayload>
	) {
		const { buildActionCreator } = initialOptions;
		const suffix = initialOptions.suffix || defaultSuffix;
		const pendingAction = buildActionCreator(`${type}${suffix.pending}`);
		const rejectedAction = buildActionCreator(
			`${type}${suffix.rejected}`,
			(err: any) => err
		);
		const fulfilledAction = buildActionCreator(
			`${type}${suffix.fulfilled}`,
			(payload: TPayload) => payload
		);
		const action = () => async (
			disp: ThunkDispatch<TState, undefined, AnyAction>,
			gs: () => TState
		) => {
			disp(pendingAction());
			try {
				const payload = await promise();
				return disp(fulfilledAction(payload));
			} catch (err) {
				disp(rejectedAction(err));
			}
		};
		return Object.assign(action, {
			pending: pendingAction,
			rejected: rejectedAction,
			fulfilled: fulfilledAction,
			toString: () => {
				throw new Error(
					'Forbidden to stringify an async action creator. Use the subordinate action creators instead.'
				);
			}
		});
	};
}
