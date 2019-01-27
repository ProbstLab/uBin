import * as React from 'react';
import * as Redux from 'react-redux';
import { History } from 'history';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router'
import {Route} from "react-router";
import {App} from "../app";
// import Routes from '../routes';

interface IRootType {
  store: Redux.Store<any>;
  history: History
};

export default function Root({ store, history }: IRootType) {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Route component={App} />
      </ConnectedRouter>
    </Provider>
  );
}
