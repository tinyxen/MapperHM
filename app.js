/ ======================
// MAP
// ======================

const map = L.map('map').setView(
  [61.0042, 69.0019],
  15
);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: ''
  }
).addTo(map);

// ======================
// PLAYER
// ======================

let playerMarker = null;

// ======================
// GAME
// ======================

let playMode = false;

let currentClan = "NONE";

const clanScores = {
  sp: 0
};

// ======================
// GRID
// ======================

const CELL_SIZE = 80;

const RADIUS = 5;

const cells = {};

const owners = {};

// ======================
// METERS
// ======================

function latStep(m) {
  return m / 111320;
}

function lngStep(m, lat) {
  return m / (
    111320 *
    Math.cos(lat * Math.PI / 180)
  );
}

// ======================
// CELL ID
// ======================

function getCell(lat, lng) {

  const stepLat = latStep(CELL_SIZE);

  const stepLng = lngStep(
    CELL_SIZE,
    lat
  );

  const x = Math.floor(lat / stepLat);

  const y = Math.floor(lng / stepLng);

  return `${x}_${y}`;
}

// ======================
// GRID
// ======================

function renderGrid(lat, lng) {

  Object.values(cells)
  .forEach(c => map.removeLayer(c));

  const stepLat = latStep(CELL_SIZE);

  const stepLng = lngStep(
    CELL_SIZE,
    lat
  );

  const cx = Math.floor(lat / stepLat);

  const cy = Math.floor(lng / stepLng);

  for (let x = -RADIUS; x <= RADIUS; x++) {

    for (let y = -RADIUS; y <= RADIUS; y++) {

      const lat1 = (cx + x) * stepLat;

      const lng1 = (cy + y) * stepLng;

      const id = `${cx + x}_${cy + y}`;

      const color =
        owners[id] || "#666";

      const rect = L.rectangle(
        [
          [lat1, lng1],
          [
            lat1 + stepLat,
            lng1 + stepLng
          ]
        ],
        {
          color: color,
          weight: 0.3,
          fillOpacity:
            owners[id] ? 0.35 : 0
        }
      ).addTo(map);

      cells[id] = rect;
    }
  }
}

// ======================
// LEADERBOARD
// ======================

function updateLeaderboard() {

  document.getElementById(
    "leaderboardContent"
  ).innerHTML = `
    SP — ${clanScores.sp}
  `;
}

updateLeaderboard();

// ======================
// CAPTURE
// ======================

function captureCell(lat, lng) {

  if (!playMode) return;

  const id = getCell(lat, lng);

  if (!owners[id]) {

    owners[id] = "#00ff00";

    clanScores.sp++;

    updateLeaderboard();
  }
}

// ======================
// GPS
// ======================

navigator.geolocation.watchPosition(

  pos => {

    const lat =
      pos.coords.latitude;

    const lng =
      pos.coords.longitude;

    // PLAYER

    if (!playerMarker) {

      playerMarker =
      L.circleMarker(
        [lat, lng],
        {
          radius: 8,
          color: "#00ff00",
          fillColor: "#00ff00",
          fillOpacity: 1
        }
      ).addTo(map);

    } else {

      playerMarker.setLatLng(
        [lat, lng]
      );
    }

    // CAPTURE

    captureCell(lat, lng);

    // GRID

    renderGrid(lat, lng);

  },

  err => {

    alert("GPS ERROR");

  },

  {
    enableHighAccuracy: true
  }

);

// ======================
// PLAY BUTTON
// ======================

const playBtn =
document.getElementById(
  "playBtn"
);

playBtn.onclick = () => {

  playMode = !playMode;

  if (playMode) {

    playBtn.innerText =
      "⏸ STOP";

    playBtn.style.background =
      "red";

  } else {

    playBtn.innerText =
      "▶ PLAY";

    playBtn.style.background =
      "lime";
  }
};

// ======================
// ADMIN
// ======================

const adminBtn =
document.getElementById(
  "adminBtn"
);

const adminPanel =
document.getElementById(
  "adminPanel"
);

adminBtn.onclick = () => {

  const code =
    prompt("ADMIN CODE");

  if (
    code === "tinyxen12zov"
  ) {

    currentClan = "SP";

    document.getElementById(
      "clanLabel"
    ).innerText =
      "КЛАН: SP";

    adminPanel.style.display =
      "block";

  } else {

    alert("WRONG CODE");
  }
};

// ======================
// WIPE
// ======================

document.getElementById(
  "wipeBtn"
).onclick = () => {

  for (let key in owners) {
    delete owners[key];
  }

  clanScores.sp = 0;

  updateLeaderboard();

  alert("MAP WIPED");
};

// ======================
// SEARCH
// ======================

document.getElementById(
  "searchBtn"
).onclick = async () => {

  const query =
  document.getElementById(
    "searchInput"
  ).value;

  if (!query) return;

  const url =
  `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

  const res =
  await fetch(url);

  const data =
  await res.json();

  if (data.length > 0) {

    const place = data[0];

    map.setView(
      [
        place.lat,
        place.lon
      ],
      17
    );

    L.marker([
      place.lat,
      place.lon
    ])
    .addTo(map);

  } else {

    alert("НЕ НАЙДЕНО");
  }
};

```
