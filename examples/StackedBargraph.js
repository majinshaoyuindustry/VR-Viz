import React, { Component } from 'react';
import './App.css';
import VRViz from './Component/Visualization.js'
import mapData from './mapData/mapData.json'

class App extends Component {
  render() {
    return (
      <VRViz
        scene={
          {
            'sky': {
              'style': {
                'color': '#ccc',
                'texture': false,
              }
            },
            'lights': [
              {
                'type': 'directional',
                'color': '#fff',
                'position': '0 1 1',
                'intensity': 1,
                "decay": 1,
              },
              {
                'type': 'ambient',
                'color': '#fff',
                'intensity': 1,
                "decay": 1,
              }
            ],
            'camera': {
              'position': '0 0 10',
              'rotation': '0 0 0',
            },
            'floor': {
              'style': {
                'color': '#ccc',
                'texture': false,
                'width': 100,
                'depth': 100,
              }
            }
          }
        }
        graph={
          [
            {
              'type': 'StackedBarGraph',
              'style': {
                'origin': [0, 0, 0],
                'dimensions': {
                  'width': 10,
                  'height': 10,
                  'depth': 10,
                },
              },
              'data': {
                'dataFile': "data/stackedBarChart.csv",
                'fileType': 'csv',
                'fieldDesc': [['Cars', 'number'], ['Trucks', 'number'], ['Bikes', 'number'], ['Countries', 'text'], ['Quarters', 'text']]
              },
              'mark': {
                'position': {
                  'x': {
                    'scaleType': 'ordinal',
                    'field': 'Quarters',
                  },
                  'z': {
                    'scaleType': 'ordinal',
                    'field': 'Countries',
                  }
                },
                'type': 'box',
                'style': {
                  'padding': {
                    'x': 0.1,
                    'z': 0.1,
                  },
                  'height': {
                    'scaleType': 'linear',
                    'field': ['Cars', 'Trucks', 'Bikes'],
                    'startFromZero': true,
                  },
                  'fill': {
                    'scaleType': 'ordinal',
                    'opacity': 0.4,
                    'color': ['green', 'blue', 'red'],
                    'field': ['Cars', 'Trucks', 'Bikes'],
                  },
                },
                'mouseOver': {
                  'focusedObject': {
                    'opacity': 1,
                    'fill': '#333',
                  },
                  'nonFocusedObject': {
                    'opacity': 0.1,
                  },
                  'label': {
                    'value': (d) => `Label:LabelValue\nCountry:${d.Countries}\nQuarter:${d.Quarters}`,
                    'align': 'center',
                    'fontSize': 1,
                    'backgroundColor': '#333',
                    'backgroundOpacity': 1,
                    'fontColor': '#fff',
                  }
                }
              },
              'axis': {
                'axis-box': {
                  'color': 'black',
                },
                'x-axis': {
                  'orient': 'bottom-back',
                  'title': {
                    'text': '',
                    'fontSize': 10,
                    'color': 'black',
                    'opacity': 1,
                  },
                  'ticks': {
                    'noOfTicks': 10,
                    'size': 0.1,
                    'color': 'black',
                    'opacity': 1,
                    'fontSize': 10,
                  },
                  'grid': {
                    'color': 'black',
                    'opacity': 1,
                  }
                },
                'y-axis': {
                  'orient': 'bottom-back',
                  'title': {
                    'text': '',
                    'fontSize': 10,
                    'color': 'black',
                    'opacity': 1,
                  },
                  'ticks': {
                    'noOfTicks': 10,
                    'size': 0.1,
                    'color': 'black',
                    'opacity': 1,
                    'fontSize': 10,
                  },
                  'grid': {
                    'color': 'black',
                    'opacity': 1,
                  }
                },
                'z-axis': {
                  'orient': 'bottom-back',
                  'title': {
                    'text': '',
                    'fontSize': 10,
                    'color': 'black',
                    'opacity': 1,
                  },
                  'ticks': {
                    'noOfTicks': 10,
                    'size': 0.1,
                    'color': 'black',
                    'opacity': 1,
                    'fontSize': 10,
                  },
                  'grid': {
                    'color': 'black',
                    'opacity': 1,
                  }
                }
              }
            }
          ]
        }
      />
    );
  }
}

export default App;

