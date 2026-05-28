// ======================
// MapperHM - PERFECT GRID
// ======================

const map = L.map('map').setView([61.0042, 69.0019], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// игрок
let playerMarker = null;

// ======================
// МЕТРОВАЯ СЕТКА (ВАЖНО)
// ======================

// 100 метров ≈ 0.0011 deg lat
const CELL_SIZE = 100; // meters

const cells = {};
const owners = {};

// ======================
// ПЕРЕВОД МЕТРОВ В ГРАДУСЫ
// ======================

function metersToLat(m) {
  return m / 111320;
}

function metersToLng(m, lat) {
  return m / (111320 * Math.cos(lat * Math.PI / 180));
}

// ======================
// КЛЕТКА ID
// ======================

function getCell(lat, lng) {
  const x = Math.floor(lat * 111320 / CELL_SIZE);
  const y = Math.floor(lng * 111320 / CELL_SIZE);
  return `${x}_${y}`;
}

// ======================
// РИСОВАНИЕ СЕТКИ
// ======================

function renderGrid(lat, lng) {

  Object.values(cells).forEach(c => map.removeLayer(c));
  Object.keys(cells).forEach(k => delete cells[k]);

  const cx = Math.floor(lat * 111320 / CELL_SIZE);
  const cy = Math.floor(lng * 111320 / CELL_SIZE);

  const radius = 4;

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {

      const cellLat = ((cx + x) * CELL_SIZE) / 111320;
      const cellLng = ((cy + y) * CELL_SIZE) / (111320 * Math.cos(lat * Math.PI / 180));

      const bounds = [
        [cellLat, cellLng],
        [
          cellLat + metersToLat(CELL_SIZE),
          cellLng + metersToLng(CELL_SIZE, lat)
        ]
      ];

      const id = `${cx + x}_${cy + y}`;

      const rect = L.rectangle(bounds, {
        color: "#666",
        weight: 1,
        fillOpacity: 0.08
      }).addTo(map);

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
