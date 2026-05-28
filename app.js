// ======================
// MAP
// ======================

const map = L.map('map').setView([61.0042, 69.0019], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
}).addTo(map);

// ======================
// PLAYER
// ======================

let playerMarker = null;

// ======================
// GRID
// ======================

const CELL_SIZE = 80; // метров

const RADIUS = 5;

const cells = {};

// владельцы клеток
const owners = {};

// ======================
// ПЕРЕВОД МЕТРОВ
// ======================

function latStep(m) {
  return m / 111320;
}

function lngStep(m, lat) {
  return m / (111320 * Math.cos(lat * Math.PI / 180));
}

// ======================
// CELL ID
// ======================

function getCell(lat, lng) {

  const stepLat = latStep(CELL_SIZE);
  const stepLng = lngStep(CELL_SIZE, lat);

  const x = Math.floor(lat / stepLat);
  const y = Math.floor(lng / stepLng);

  return `${x}_${y}`;
}

// ======================
// GRID RENDER
// ======================

function renderGrid(lat, lng) {

  Object.values(cells).forEach(c => map.removeLayer(c));

  const stepLat = latStep(CELL_SIZE);
  const stepLng = lngStep(CELL_SIZE, lat);

  const cx = Math.floor(lat / stepLat);
  const cy = Math.floor(lng / stepLng);

  for (let x = -RADIUS; x <= RADIUS; x++) {
    for (let y = -RADIUS; y <= RADIUS; y++) {

      const lat1 = (cx + x) * stepLat;
      const lng1 = (cy + y) * stepLng;

      const id = `${cx + x}_${cy + y}`;

      // цвет клетки
      const color = owners[id] || "#666";

      const rect = L.rectangle(
        [
          [lat1, lng1],
          [lat1 + stepLat, lng1 + stepLng]
        ],
        {
          color: color,
          weight: 0.3,
          fillOpacity: owners[id] ? 0.35 : 0
        }
      ).addTo(map);

      cells[id] = rect;
    }
  }
}

// ======================
// ЗАХВАТ
// ======================

function captureCell(lat, lng) {

  const id = getCell(lat, lng);

  owners[id] = "#00ff00";
}

// ======================
// GPS
// ======================

navigator.geolocation.watchPosition(pos => {

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  // игрок
  if (!playerMarker) {

    playerMarker = L.circleMarker([lat, lng], {
      radius: 8,
      color: "#00ff00",
      fillColor: "#00ff00",
      fillOpacity: 1
    }).addTo(map);

  } else {

    playerMarker.setLatLng([lat, lng]);

  }

  // мгновенный захват
  captureCell(lat, lng);

  // сетка
  renderGrid(lat, lng);

},
(err) => {

  alert("GPS ERROR");

},
{
  enableHighAccuracy: true
});

// ======================
// ADMIN
// ======================

const adminBtn = document.getElementById("adminBtn");

const adminPanel = document.getElementById("adminPanel");

adminBtn.onclick = () => {

  const code = prompt("ADMIN CODE");

  if (code === "tinyxen12zov") {

    adminPanel.style.display = "block";

  } else {

    alert("WRONG");

  }
};

// ======================
// WIPE
// ======================

document.getElementById("wipeBtn").onclick = () => {

  for (let key in owners) {
    delete owners[key];
  }

  alert("MAP WIPED");
};
