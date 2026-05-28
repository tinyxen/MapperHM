// ======================
// MapperHM - GRID SYSTEM
// ======================

const map = L.map('map').setView([61.0042, 69.0019], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
}).addTo(map);

let playerMarker = null;

// настройки сетки
const GRID_SIZE = 0.0015; // ~150м
const RADIUS = 4;

const cells = {};
const owners = {};

// ======================

function getCell(lat, lng) {
  const x = Math.floor(lat / GRID_SIZE);
  const y = Math.floor(lng / GRID_SIZE);
  return `${x}_${y}`;
}

// ======================
// РИСУЕМ СЕТКУ ВОКРУГ ИГРОКА
// ======================

function renderGrid(lat, lng) {

  Object.values(cells).forEach(c => map.removeLayer(c));
  Object.keys(cells).forEach(k => delete cells[k]);

  const cx = Math.floor(lat / GRID_SIZE);
  const cy = Math.floor(lng / GRID_SIZE);

  for (let x = -RADIUS; x <= RADIUS; x++) {
    for (let y = -RADIUS; y <= RADIUS; y++) {

      const lat1 = (cx + x) * GRID_SIZE;
      const lng1 = (cy + y) * GRID_SIZE;

      const id = `${cx + x}_${cy + y}`;

      const color = owners[id] || "#666";

      const rect = L.rectangle(
        [[lat1, lng1], [lat1 + GRID_SIZE, lng1 + GRID_SIZE]],
        {
          color: color,
          weight: 1,
          fillOpacity: 0.08
        }
      ).addTo(map);

      cells[id] = rect;
    }
  }
}

// ======================
// GPS
// ======================

navigator.geolocation.watchPosition(pos => {

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  if (!playerMarker) {
    playerMarker = L.marker([lat, lng]).addTo(map);
  } else {
    playerMarker.setLatLng([lat, lng]);
  }

  map.setView([lat, lng], 17);

  renderGrid(lat, lng);

});
