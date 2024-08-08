let map;
let markers = []; // Ensure this is defined globally

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");
    
    // Initialize the map
    map = L.map('map').setView([34.0522, -118.2437], 10); // Default to Los Angeles
    console.log("Map initialized");

    // Load a tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    console.log("Tile layer added");

    // Fetch and load the location data
    fetch('/data/Millard_Sheets_Studio_Locations.json')
        .then(response => response.json())
        .then(data => {
            console.log("JSON data loaded", data);
            loadLocations(data);
            document.getElementById('filter').addEventListener('input', () => filterLocations(data));
        })
        .catch(error => console.error('Error loading the JSON data:', error));
});

function loadLocations(locations) {
    console.log("Loading locations", locations);
    const locationContainer = document.getElementById('locations');
    locationContainer.innerHTML = '';

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    locations.forEach(location => {
        if (location.Latitude && location.Longitude) {
            const marker = L.marker([location.Latitude, location.Longitude])
                .addTo(map)
                .bindPopup(generatePopupContent(location));
            console.log("Marker added", marker);

            markers.push(marker);

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = generateCardContent(location);
            card.addEventListener('click', () => {
                map.setView(marker.getLatLng(), 15);
                marker.openPopup();
            });
            locationContainer.appendChild(card);
        }
    });
}

function filterLocations(locations) {
    const filterText = document.getElementById('filter').value.toLowerCase();
    console.log("Filtering locations with", filterText);
    const filteredLocations = locations.filter(location =>
        location.City && location.City.toLowerCase().includes(filterText)
    );
    console.log("Filtered locations", filteredLocations);
    loadLocations(filteredLocations);
}

function generatePopupContent(location) {
    return `
        <b>${location.Firm}</b><br>
        ${location.Address ? location.Address + '<br>' : ''}
        ${location.City}, ${location.State}
    `;
}

function generateCardContent(location) {
    let content = `
        <h3>${location.Firm}</h3>
        <p><strong>Address:</strong> ${location.Address || 'N/A'}</p>
        <p><strong>City:</strong> ${location.City}, ${location.State}</p>
        <p><strong>Date Acquired/Opened:</strong> ${location.DateAcquiredOrOpened || 'N/A'}</p>
        <p><strong>Art Construction Date:</strong> ${location.ArtConstructionDate || 'N/A'}</p>
    `;

    if (location.Mosaic) content += `<p><strong>Mosaic:</strong> Yes</p>`;
    if (location.StainedGlass) content += `<p><strong>Stained Glass:</strong> Yes</p>`;
    if (location.Sculpture) content += `<p><strong>Sculpture:</strong> Yes</p>`;
    if (location.FabricWork) content += `<p><strong>Fabric Work:</strong> Yes</p>`;
    if (location.Furnishings) content += `<p><strong>Furnishings:</strong> Yes</p>`;
    if (location.PaintedMural) content += `<p><strong>Painted Mural:</strong> Yes</p>`;
    if (location.Subjects) content += `<p><strong>Subjects:</strong> ${location.Subjects}</p>`;
    if (location.WorkedOnBy) content += `<p><strong>Worked On By:</strong> ${location.WorkedOnBy}</p>`;
    if (location.ArchivalRecords) content += `<p><strong>Archival Records:</strong> ${location.ArchivalRecords}</p>`;

    return content;
}