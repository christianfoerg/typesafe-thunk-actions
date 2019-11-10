# Motivation

TypeScript and redux are both awesome, but require a lot of type declarations for actions in order to work fully typesafe together. So I researched about best practices for combining TypeScript with redux, and I found an awesome project called [typesafe-actions](https://github.com/piotrwitek/typesafe-actions/). It provides multiple ways to create action creators.

What I was missing is an easy way to deal with async action creators. Indeed, typesafe-actions provides a function called `createAsyncAction`. But it requires you to create plain action creators that are clustered in one object then and to invoke them individually. I wanted to have a standardized way to deal with async actions, e.g. API calls. And because I also use redux-thunk in my projects, it seemed a good idea to include the dispatch and getState functions into such a function.

So, this package could be a good fit for you if you use [redux-thunk](https://github.com/reduxjs/redux-thunk) and want to combine it with [typesafe-actions](https://github.com/piotrwitek/typesafe-actions/), or if you love TypeScript and redux and use the [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware).

<!-- # Installation

Run this script
```
npm install typesafe-thunk-actions
``` -->

# Documentation

## createAsyncThunkAction

You need [redux-thunk](https://github.com/reduxjs/redux-thunk) in your redux middlewares in order to use this function.

```ts
/* ./count/actions.ts */

import { buildActionCreator } from '../redux';

export const add = buildActionCreator('add', (count: number) => count);

export const subtract = buildActionCreator(
	'subtract',
	(count: number, dispatch, getState) => count
);

export const multiply = (factor: number) => ({
	type: 'multiply',
	payload: factor
});
```

If you need the `dispatch` and/or the `getState` argument and don't want to invoke the action creator function with any argument, you can just declare the first argument as type `void`:

```ts
const updateProfile = createAsyncThunkAction(
	'update_profile',
	(arg: void, dispatch, getState: () => State) => {
		const state = getState();
		// e.g. send state of a profile form to your server
	}
);

dispatch(updateProfile());
```

## createReducer

```ts
/* ./count/reducers.ts */

import { createReducer } from 'typesafe-thunk-actions';
import { add, subtract } from './actions';

export const reducer = createReducer<number>(0)
	.handleAction(add, (state, action) => state + action.payload) // payload is of type number
	.handleAction(subtract, (state, action) => state - action.payload) // payload is of type number
	.handleAnyAction('multiply', (state, action) => state * action.payload); // action is of type AnyAction
```

In that example you wouldn't actually need the diamond operator because TypeScript would infer the correct type from the initial reducer state (`0`).
But there are many cases where the initial state would be null and you would want to set the type in the diamond operator.
Actions, you haven't created via typesafe-thunk-actions, can be processed with `handleAnyAction`.
