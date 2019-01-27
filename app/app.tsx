import * as React from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router'
// import {FileManager} from "./container/fileManager/fileManager";
// import {UBinNav} from "./components/uBinNav";
import {Home} from "./containers/home/home";
import {FileManager} from "./containers/fileManager/fileManager";
import {UBinNavigation} from "./containers/navigation/navigation";

interface IProps extends RouteComponentProps {}

export class App extends React.Component<IProps> {

    public render(): JSX.Element {
        return (
            <div className='root'>
                {/*<UBinNav location={this.props.location}/>*/}
                <Route component={UBinNavigation} />
                <div style={{ margin: "8px" }}>
                    <Switch>
                        <Route path='/files' component={FileManager} />
                        <Route path='/' component={Home} />
                        <Route component={Home} />
                    </Switch>
                </div>
            </div>
        )
    }
}
