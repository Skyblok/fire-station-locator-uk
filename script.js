// Get elements
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const postcodeInput = document.getElementById("postcode");
const radiusInput = document.getElementById("radius");
const stationsList = document.getElementById("stationsList");

let map;
let markers = [];
let fireStations = [];
let infoWindow;

// Initialize the map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 54.5, lng: -3 },
    zoom: 6,
  });
  infoWindow = new google.maps.InfoWindow();
  fetch("stations.json")
    .then(response => response.json())
    .then(data => {
      fireStations = data;
    });
}

function searchStations() {
  const postcode = postcodeInput.value.trim();
  const radiusMiles = parseFloat(radiusInput.value);
  if (!postcode) return alert("Please enter a postcode.");

  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=YOUR_API_KEY`)
    .then(response => response.json())
    .then(data => {
      if (!data.results.length) return alert("Postcode not found.");
      const location = data.results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(10);
      clearMarkers();
      displayStations(location, radiusMiles);
    })
    .catch(error => alert("Geocoding failed: " + error));
}

function displayStations(center, radiusMiles) {
  const results = fireStations.filter(station => {
    const dist = haversineDistance(center, station, true);
    return dist <= radiusMiles;
  });

  results.sort((a, b) => haversineDistance(center, a, true) - haversineDistance(center, b, true));
  stationsList.innerHTML = "";

  results.forEach(station => {
    const marker = new google.maps.Marker({
      position: { lat: station.lat, lng: station.lng },
      map: map,
      title: station.name,
    });
    markers.push(marker);

    marker.addListener("click", () => {
      infoWindow.setContent(`
        <div style="font-size: 14px;">
          <strong>${station.name}</strong><br>
          ${station.postcode}<br>
          <a href="${station.url}" target="_blank">View Details</a>
        </div>
      `);
      infoWindow.open(map, marker);
    });

    const li = document.createElement("li");
    li.innerHTML = `<strong>${station.name}</strong> (${station.postcode}) - <a href="${station.url}" target="_blank">Details</a>`;
    stationsList.appendChild(li);
  });
}

function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

function haversineDistance(loc1, loc2, miles) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = miles ? 3958.8 : 6371;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

searchBtn.addEventListener("click", searchStations);
resetBtn.addEventListener("click", () => {
  postcodeInput.value = "";
  radiusInput.value = "5";
  stationsList.innerHTML = "";
  clearMarkers();
  map.setCenter({ lat: 54.5, lng: -3 });
  map.setZoom(6);
});

window.initMap = initMap;