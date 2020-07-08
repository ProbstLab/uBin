import * as React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import { UBinNavigation } from './containers/navigation/navigation';
import { FileManager } from './containers/fileManager/fileManager';
import { Home } from './containers/home/home';


export default () => (
  <App>
    <Route component={UBinNavigation} />
    <Switch>
      <Route path='/files' component={FileManager} />
      <Route path='/' component={Home} />
      <Route component={Home} />
    </Switch>
  </App>
);
