define(require => { "use strict";

const PushButton = require('lib/components/pushbutton');
const Immutable  = require('lib/immutable');
const hexagon    = require('lib/hexagon');

const R = React.DOM;
const Point = Immutable.Record({x: 0, y: 0});

function gridToJson (grid) {
  const valueGrid = Object.assign({}, grid);
  const data = [];
  for (let coord of hexagon.grid.allCoords(grid)) {
    data.push(grid.tiles.get(coord));
  }
  valueGrid.tiles = data;
  return JSON.stringify(valueGrid);
}

function gridFromJson (json) {
  const grid = JSON.parse(json);
  const tiles = Immutable.Map().withMutations(map => {
    let i = 0;
    for (let coord of hexagon.grid.allCoords({width: grid.width, height: grid.height})) {
      map.set(new Point(coord), grid.tiles[i]);
      i++;
    }
  });
  grid.tiles = tiles;
  return grid;
}

return React.createClass({displayName: 'Download',
  getInitialState () {
    return { downloadLink: null };
  },
  componentDidMount () {
    this.uploaded = Object.assign(document.createElement('input'), { type: 'file', style: 'display:none' });
    this.uploaded.onchange = (e) => {
      const READER = new FileReader();
      READER.onload = (e) => {
        this.props.onSceneChange({ scene: gridFromJson(READER.result) });
      };
      READER.readAsText(this.uploaded.files[0]);
    };
    document.getElementById('editor').appendChild(this.uploaded);
  },
  handleLoad (e) {
    const scene = localStorage.scene;
    if (scene) {
      this.props.onSceneChange({ scene: gridFromJson(scene) });
    }
  },
  handleSave (e) {
    localStorage.scene = gridToJson(this.props.grid);
  },
  handleUpload (e) {
    this.uploaded.click();
  },
  handleDownload (e) {
    const blob = new Blob([gridToJson(this.props.grid)], {type : 'application/json'});
    this.setState({ downloadLink: URL.createObjectURL(blob) });
  },
  render () {
    return (
      R.ul({className: 'centered tool-box'},
        R.li({className: 'tool'},
          React.createElement(PushButton, {icon: 'fa-download', text: "Download current stage",
            href: this.state.downloadLink, download: "scene.json", onClick: this.handleDownload})
        ),
        R.li({className: 'tool'},
          React.createElement(PushButton, {icon: 'fa-upload', text: "Upload a stage", onClick: this.handleUpload})
        ),
        R.li({className: 'tool'},
          React.createElement(PushButton, {icon: 'fa-floppy-o', text: "Save current stage", onClick: this.handleSave})
        ),
        R.li({className: 'tool'},
          React.createElement(PushButton, {icon: 'fa-folder-open-o', text: "Load stage", onClick: this.handleLoad})
        )
      )
    );
  }
});
});
