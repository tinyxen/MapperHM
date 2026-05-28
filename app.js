// ======================
// MapperHM - WORKING VERSION
// ======================

// Ханты-Мансийск центр
const cityCenter = [61.0042, 69.0019];

// карта
const map = L.map('map').setView(cityCenter, 14);

// тайлы
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
}).addTo(map);

// игрок
let playerMarker = null;

// ======================
// GPS
// ======================

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(

    (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // создаём маркер
      if (!playerMarker) {
        playerMarker = L.marker([lat, lng]).addTo(map);
      } else {
        playerMarker.setLatLng([lat, lng]);
      }

      // центрируем карту
      map.setView([lat, lng], 16);

    },

    (err) => {
      alert("GPS ошибка: " + err.message);
    },

    {
      enableHighAccuracy: true,
      timeout: 10000
    }

  );

} else {
  alert("GPS не поддерживается");
}