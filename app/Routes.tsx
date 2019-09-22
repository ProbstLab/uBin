import * as React from 'react';
import { Switch, Route } from 'react-router';
// const routes = require('./constants/routes.json');
import App from './containers/App';
import { UBinNavigation } from './containers/navigation/navigation';
import { FileManager } from './containers/fileManager/fileManager';
import { Home } from './containers/home/home';
// import HomePage from './containers/HomePage';
// import CounterPage from './containers/CounterPage';


export default () => (
  <App>
    {/*<Switch>*/}
    {/*  <Route path={routes.COUNTER} component={CounterPage} />*/}
    {/*  <Route path={routes.HOME} component={HomePage} />*/}
    {/*</Switch>*/}
    <Route component={UBinNavigation} />
    <Switch>
      <Route path='/files' component={FileManager} />
      <Route path='/' component={Home} />
      <Route component={Home} />
    </Switch>
    {/*<div style={{ margin: "8px" }}>*/}
    {/*  <Switch>*/}
    {/*    <Route path='/files' component={FileManager} />*/}
    {/*    <Route path='/' component={Home} />*/}
    {/*    <Route component={Home} />*/}
    {/*  </Switch>*/}
    {/*</div>*/}
  </App>
);
