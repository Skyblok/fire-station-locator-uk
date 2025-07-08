
// script.js

let map;
let markers = [];

const fireStations = [
  {
    name: "Leeds Central Fire Station",
    postcode: "LS1 1UR",
    lat: 53.7962,
    lng: -1.5476,
    url: "https://www.ukfirestations.co.uk/Leeds-Central"
  },
  {
    name: "Bradford Fire Station",
    postcode: "BD1 2AW",
    lat: 53.7920,
    lng: -1.7580,
    url: "https://www.ukfirestations.co.uk/Bradford"
  },
  {
    name: "Wakefield Fire Station",
    postcode: "WF1 3ES",
    lat: 53.6833,
    lng: -1.5000,
    url: "https://www.ukfirestations.co.uk/Wakefield"
  }
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.8, lng: -1.55 },
    zoom: 10,
    styles: [],
  });

  addMarkers();
}

function addMarkers() {
  fireStations.forEach((station) => {
    const marker = new google.maps.Marker({
      position: { lat: station.lat, lng: station.lng },
      map: map,
      title: station.name,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-size: 14px;">
          <strong>${station.name}</strong><br>
          ${station.postcode}<br>
          <a href="${station.url}" target="_blank">View Details</a>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}
