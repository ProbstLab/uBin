import * as React from 'react';
import { Component } from 'react';
import Home from '../components/Home';
import {createConnection} from "typeorm";

export default class HomePage extends Component {
  render() {
    console.log("create connection");
    createConnection().then(() => {
      console.log("connection created");
    }).catch((e) => console.log(e));
    return <Home />;
  }
}
