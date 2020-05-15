import React from 'react';
import { Map, ImageOverlay, Marker } from 'react-leaflet';
import { cloneDeep } from 'lodash';
import L from 'leaflet';

const scaleSize = (size, zoom) => ((zoom + 2) / 4) * size;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 0,
      lng: 0,
      zoom: -1,
      heroes: {}
    };
    this.connection = new WebSocket('ws://localhost:8080');
    this.connection.onmessage = this.onSocketMessage.bind(this);
  }

  buildIcon(house, zoom) {
    const heroIconImg = `${this.armyCoatPath}${house}.png`;
    return L.icon({
      iconUrl: heroIconImg,
      iconSize: [
        scaleSize(100, zoom),
        scaleSize(100, zoom)
      ]
    });
  }

  onSocketMessage({data}) {
    const heroes = cloneDeep(this.state.heroes);
    const {hero, house, x, y} = JSON.parse(data);
    // hero is already on map - move marker
    if (heroes.hasOwnProperty(hero)) {
      const heroItem = heroes[hero];
      heroItem.position = L.latLng(y, x);
      this.setState({heroes});
      return;
    }
    heroes[hero] = {
      position: L.latLng(y, x),
      icon: this.buildIcon(house, this.state.zoom),
      title: hero,
      house: house,
      hero: hero
    };
    this.setState({heroes})
  }

  scale(zoom) {
    return (zoom + 2) / 4
  }

  get armyCoatPath() {
    return 'img/coat-of-arms/';
  }

  get mapUrl() {
    return 'img/map/map.png';
  }

  get height() {
    return 890;
  }

  get width() {
    return 1288;
  }

  handleZoom = (event) => {
    const zoom = event.sourceTarget.getZoom();
    const heroes = cloneDeep(this.state.heroes);
    Object.keys(heroes).forEach(key => {
      const heroItem = heroes[key];
      heroItem.icon = this.buildIcon(heroItem.house, zoom);
    });
    this.setState({heroes, zoom});
  };

  render() {
    const bounds = L.latLngBounds([
      [0, 0],
      [this.height, this.width]
    ]);
    return <Map
      center={[this.state.lat, this.state.lng]}
      zoom={this.state.zoom}
      minZoom="-1"
      maxZoom="3"
      maxBoundsViscosity="1"
      maxBounds={bounds}
      crs={L.CRS.Simple}
      onZoom={this.handleZoom}>
      <ImageOverlay url={this.mapUrl} bounds={bounds}>
        {Object.keys(this.state.heroes).map(key => {
          const item = this.state.heroes[key];
          return <Marker position={item.position}
                         key={item.hero}
                         icon={item.icon}
                         title={item.title}/>;
        })}
      </ImageOverlay>
    </Map>;
  }
};


