let map;
let markers = [];
let infoWindow;
let stationData = [];

async function initMap() {
  const response = await fetch('stations.json');
  stationData = await response.json();

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 53.7997, lng: -1.5492 },
    zoom: 8,
    styles: [ { elementType: "geometry", stylers: [{ color: "#212121" }] } ]
  });

  infoWindow = new google.maps.InfoWindow();

  document.getElementById('searchBtn').addEventListener('click', runSearch);
  document.getElementById('resetBtn').addEventListener('click', resetSearch);

  displayStations(stationData);
}

function resetSearch() {
  document.getElementById('postcode').value = '';
  document.getElementById('radius').value = '5';
  document.querySelectorAll('.status-filter').forEach(cb => cb.checked = true);
  displayStations(stationData);
}

function runSearch() {
  const postcode = document.getElementById('postcode').value.trim();
  const radius = parseInt(document.getElementById('radius').value);
  const statusFilters = Array.from(document.querySelectorAll('.status-filter'))
    .filter(cb => cb.checked).map(cb => cb.value);

  if (!postcode) return;

  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=AIzaSyCQFt030Dit0bCRw6TluHmCzOQmkZ-ISEQ`)
    .then(res => res.json())
    .then(data => {
      const location = data.results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(10);

      // Add pink marker
      new google.maps.Marker({
        map,
        position: location,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#FF00FF",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white"
        }
      });

      const filtered = stationData.filter(station => {
        const dist = haversine(location.lat, location.lng, station.lat, station.lng);
        return dist <= radius && statusFilters.includes(station.status);
      });

      displayStations(filtered);
    });
}

function displayStations(stations) {
  markers.forEach(m => m.setMap(null));
  markers = [];

  const list = document.getElementById('stationsList');
  list.innerHTML = '';

  stations.forEach(station => {
    const marker = new google.maps.Marker({
      map,
      position: { lat: station.lat, lng: station.lng },
      title: station.name,
      icon: {
        url: getMarkerColor(station.status)
      }
    });

    marker.addListener('click', () => {
      infoWindow.setContent(\`
        <strong>\${station.name}</strong><br>
        \${station.postcode}<br>
        <a href="\${station.url}" target="_blank">View Details</a>
      \`);
      infoWindow.open(map, marker);
    });

    markers.push(marker);

    const li = document.createElement('li');
    li.innerHTML = \`\${station.name} (\${station.status}) - \${station.postcode}\`;
    list.appendChild(li);
  });
}

function getMarkerColor(status) {
  switch (status) {
    case 'Wholetime': return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    case 'Retained': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    case 'Day Crewed': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    default: return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}