import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	EmptyAC,
	PayloadAC,
	createAction,
	createStandardAction
} from 'typesafe-actions';

export function createAsyncThunkAction<
	T extends string,
	TPayload,
	TState = any,
	TArg = undefined
>(
	type: T,
	createHandler: (
		arg: TArg,
		dispatch: ThunkDispatch<TState, undefined, AnyAction>,
		getState: () => TState
	) => Promise<TPayload>
): StandardAsyncActionReturnType<TArg, TState> & ApiActions<TPayload> {
	const apiActions = {
		request: createAction(`${type}.request`),
		success: createStandardAction(`${type}.success`)<TPayload>(),
		failure: createStandardAction(`${type}.failure`)<Error>()
	};
	const promiseHandler = (arg: TArg) => async (
		dispatch: ThunkDispatch<TState, undefined, AnyAction>,
		getState: () => TState
	) => {
		dispatch(apiActions.request());
		try {
			const payload = await createHandler(arg, dispatch, getState);
			dispatch(apiActions.success(payload));
		} catch (err) {
			dispatch(apiActions.failure(err));
		}
	};
	const func = promiseHandler as StandardAsyncActionReturnType<TArg, TState>;
	return Object.assign(func, {
		request: apiActions.request,
		success: apiActions.success,
		failure: apiActions.failure,
		toString: () => {
			throw new Error(
				'Forbidden to stringify an async action creator. Use the subordinate action creators instead.'
			);
		}
	});
}

type StandardAsyncActionReturnType<TArg, TState> = TArg extends undefined
	? () => (
			dispatch: ThunkDispatch<TState, undefined, AnyAction>,
			getState: () => TState
	  ) => Promise<void>
	: (
			arg: TArg
	  ) => (
			dispatch: ThunkDispatch<TState, undefined, AnyAction>,
			getState: () => TState
	  ) => Promise<void>;

interface ApiActions<TPayload> {
	request: EmptyAC<string>;
	success: [TPayload] extends [undefined]
		? unknown extends TPayload
			? PayloadAC<string, TPayload>
			: EmptyAC<string>
		: PayloadAC<string, TPayload>;
	failure: PayloadAC<string, Error>;
}
