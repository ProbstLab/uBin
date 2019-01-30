import {LabelSeries, Sunburst} from "react-vis";
import * as React from "react";

export const EXTENDED_DISCRETE_COLOR_RANGE = [
  '#19CDD7',
  '#DDB27C',
  '#88572C',
  '#FF991F',
  '#F15C17',
  '#223F9A',
  '#DA70BF',
  '#125C77',
  '#4DC19C',
  '#776E57',
  '#12939A',
  '#17B8BE',
  '#F6D18A',
  '#B7885E',
  '#FFCB99',
  '#F89570',
  '#829AE3',
  '#E79FD5',
  '#1E96BE',
  '#89DAC1',
  '#B3AD9E',
]

const sunburstLabelStyle = {
  fontSize: '8px',
  textAnchor: 'middle',
} as React.CSSProperties


function getNamePath(node: any): any {
  if (!node.parent) {
    return ['root']
  }
  return [(node.data && node.data.name) || node.name].concat(getNamePath(node.parent))
}

function getKeyPath(node: any): any {
  if (!node.parent) {
    return []
  }
  return [(node.data && node.data.id) || node.id].concat(getKeyPath(node.parent))
}

function getKeyAndNamePath(node: any): any {
  if (!node.parent) {
    return ['root']
  }
  return {keyPath: [(node.data && node.data.id) || node.id].concat(getKeyPath(node.parent)),
          namePath: [(node.data && node.data.name) || node.name].concat(getNamePath(node.parent))}
}

function updateData(data: any, keyPath: any): any {
  if (data.children) {
    data.children.map((child: any) => updateData(child, keyPath))
  }
  // add a fill to all the uncolored cells
  if (!data.hex) {
    data.style = {
      fill: EXTENDED_DISCRETE_COLOR_RANGE[5],
    }
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.id] ? 0.2 : 1,
  };

  return data
}


interface IProps {
  data: any
}

export interface ISunburstState {
  namePathValue: string,
  finalValue: string,
  clicked: boolean
}

export class UBinSunburst extends React.Component<IProps> {

  public state: ISunburstState = {
    namePathValue: '',
    finalValue: 'Taxonomy',
    clicked: false
  }

  render(): JSX.Element {
    const {finalValue, clicked, namePathValue} = this.state
    return (
      <div>
        <Sunburst
          animation
          className="basic-sunburst-example"
          hideRootNode
          onValueMouseOver={node => {
            if (clicked) {
              return;
            }
            let {keyPath, namePath} = getKeyAndNamePath(node)
            keyPath = keyPath.reverse()
            namePath = namePath.reverse()
            const pathAsMap = keyPath.reduce((res: any, row: any) => {
              res[row] = true;
              return res;
            }, {});
            this.setState({
              finalValue: namePath[namePath.length - 1],
              pathValue: namePath.join(' > '),
              data: updateData(this.props.data, pathAsMap)
            });
          }}
          onValueMouseOut={() =>
            clicked
              ? () => {}
              : this.setState({
                pathValue: false,
                finalValue: false,
                data: updateData(this.props.data, false)
              })
          }
          onValueClick={() => this.setState({clicked: !clicked})}
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5'
          }}
          colorType="literal"
          getSize={(d: any) => d.value}
          getColor={(d: any) => d.hex}
          data={this.props.data}
          height={300}
          width={350}
        >
          {finalValue && (
            <LabelSeries
              data={[{x: 0, y: 0, label: finalValue, style: sunburstLabelStyle}]}
            />
          )}
        </Sunburst>
        <div className="basic-sunburst-example-path-name">{namePathValue}</div>
      </div>
    )
  }
}