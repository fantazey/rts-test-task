const IMG_HEIGHT = 890, IMG_WIDTH = 1288;
const ELEM_ID = 'mapid';
const IMG_OVERLAY_PATH = 'img/map/map.png';
const IMG_ARMY_COAT_PATH = 'img/coat-of-arms/';
const heroes = {};
const socket = new WebSocket('ws://localhost:8080');
socket.onmessage = socketOnMessageHandler;
const map = initMap();

function initMap() {
  const map = L.map(ELEM_ID, {
    minZoom: -1,
    maxZoom: 3,
    center: [0, 0],
    zoom: -1,
    maxBoundsViscosity: 1,
    crs: L.CRS.Simple
  });
  const mapBounds = [
    [0, 0],
    [IMG_HEIGHT, IMG_WIDTH]
  ];
  const overlay = L.imageOverlay(IMG_OVERLAY_PATH, mapBounds);
  overlay.addTo(map);
  map.setMaxBounds(overlay.getBounds());
  map.on('zoom', function (event) {
    resizeMarkerIcons();
  });

  return map;
}

function resizeMarkerIcons() {
  Object.keys(heroes).forEach(key => {
    const marker = heroes[key];
    marker.setIcon(buildIcon(marker.options.house));
  });
}

function buildIcon(house) {
  const heroIconImg = `${IMG_ARMY_COAT_PATH}${house}.png`;
  const k = (map.getZoom() + 2) / 4;
  return L.icon({
    iconUrl: heroIconImg,
    iconSize: [100 * k, 100 * k]
  });
}

function socketOnMessageHandler({data}) {
  const {hero, house, x, y} = JSON.parse(data);
  // hero is already on map - move marker
  if (heroes.hasOwnProperty(hero)) {
    const marker = heroes[hero];
    marker.setLatLng(L.latLng(y, x));
    return;
  }

  // add new marker
  const heroMarker = L.marker(
    L.latLng(y, x),
    {
      icon: buildIcon(house),
      title: hero,
      house: house,
      hero: hero
    }
  );
  heroMarker.addTo(map);
  heroes[hero] = heroMarker;
}

