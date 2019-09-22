import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import {connectRouter, routerMiddleware} from 'connected-react-router';
import promise from 'redux-promise-middleware'
import {dbReducer, fileTreeReducer, IClientState, samplesReducer} from "../controllers";
import {DBActions} from "../controllers/database";

const history = createHashHistory();
const rootReducer = combineReducers<IClientState>({
  samples: samplesReducer,
  fileTree: fileTreeReducer,
  database: dbReducer,
  router: connectRouter(history),
});
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router, promise());

function configureStore(initialState?: any) {
  const store = createStore(rootReducer, initialState, enhancer);
  store.dispatch<any>(DBActions.startDatabase());
  return store
}

export default { configureStore, history };
