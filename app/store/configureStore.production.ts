import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory'
import promise from 'redux-promise-middleware'

import {samplesReducer, IClientState, fileTreeReducer, dbReducer} from '../controllers'
import {DBActions} from '../controllers/database'

const history = createHistory()

const enhancers = []
const middleware = [thunk, routerMiddleware(history), promise()]

const devToolsExtension = (window as any).__REDUX_DEVTOOLS_EXTENSION__

if (typeof devToolsExtension === 'function') {
  enhancers.push(devToolsExtension())
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers,
)

const rootReducer = combineReducers<IClientState>({
  samples: samplesReducer,
  fileTree: fileTreeReducer,
  database: dbReducer,
  router: connectRouter(history),
})

export = {
  history,
  configureStore() {
    const store = createStore(rootReducer, composedEnhancers);
    store.dispatch(DBActions.connectDatabase())

    return store;
  }
};
