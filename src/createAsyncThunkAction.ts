import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	EmptyAC,
	PayloadAC,
	createAction,
	createStandardAction,
	PayloadMetaAC,
	MetaAction,
	PayloadMetaAction
} from 'typesafe-actions';
import { ActionBuilderConstructor } from 'typesafe-actions/dist/type-helpers';

export function createAsyncThunkAction<
	T extends string,
	TPayload,
	TMeta = undefined,
	TState = any,
	TArg = undefined
>(
	type: T,
	payloadHandler: (
		arg: TArg,
		dispatch: ThunkDispatch<TState, undefined, AnyAction>,
		getState: () => TState
	) => Promise<TPayload>,
	metaHandler?: (
		arg: TArg,
		dispatch: ThunkDispatch<TState, undefined, AnyAction>,
		getState: () => TState
	) => TMeta
): StandardAsyncActionReturnType<TArg, TState> &
	AsyncActionCreators<TPayload, TMeta> {
	const asyncActionCreators: AsyncActionCreators<TPayload, TMeta> = {
		request: createStandardAction(`${type}.request`)<undefined, TMeta>(),
		success: createStandardAction(`${type}.success`)<TPayload, TMeta>(),
		failure: createStandardAction(`${type}.failure`)<Error, TMeta>()
	};
	const promiseHandler = (arg: TArg) => async (
		dispatch: ThunkDispatch<TState, undefined, AnyAction>,
		getState: () => TState
	) => {
		const meta = metaHandler ? metaHandler(arg, dispatch, getState) : undefined;
		dispatch(asyncActionCreators.request(undefined, meta));
		try {
			const payload = await payloadHandler(arg, dispatch, getState);
			dispatch(asyncActionCreators.success(payload, meta));
		} catch (err) {
			dispatch(asyncActionCreators.failure(err, meta));
		}
	};
	const func = promiseHandler as StandardAsyncActionReturnType<TArg, TState>;
	return Object.assign(func, {
		request: asyncActionCreators.request,
		success: asyncActionCreators.success,
		failure: asyncActionCreators.failure,
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

interface AsyncActionCreators<TPayload, TMeta> {
	request: ActionBuilderConstructor<string, undefined, TMeta>;
	success: ActionBuilderConstructor<string, TPayload, TMeta>;
	failure: ActionBuilderConstructor<string, Error, TMeta>;
}
