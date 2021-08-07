mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
container: 'map', // container id
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: stadium.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

const marker = new mapboxgl.Marker()
.setLngLat(stadium.geometry.coordinates)
.addTo(map);

map.addControl(new mapboxgl.NavigationControl());