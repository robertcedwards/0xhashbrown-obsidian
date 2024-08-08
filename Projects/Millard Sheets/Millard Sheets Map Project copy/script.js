let map;
let markers = [];

document.addEventListener('DOMContentLoaded', function () {
    map = L.map('map').setView([34.0522, -118.2437], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetch('/data/Millard_Sheets_Studio_Locations.json')
        .then(response => response.json())
        .then(data => {
            loadLocations(data);
            document.getElementById('filter').addEventListener('input', () => applyFiltersAndSort(data));
            document.querySelectorAll('#sidebar input[type="checkbox"], #sidebar input[type="radio"]').forEach(input => {
                input.addEventListener('change', () => applyFiltersAndSort(data));
            });
        })
        .catch(error => console.error('Error loading the JSON data:', error));
});
function loadLocations(locations) {
    console.log('Loading locations:', locations.length);
    const locationContainer = document.getElementById('locations');
    locationContainer.innerHTML = '';

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    locations.forEach((location, index) => {
        console.log(`Processing location ${index + 1}:`, location.Firm);
        if (location.Latitude && location.Longitude) {
            const popupContent = generatePopupContent(location);
            console.log('Popup content:', popupContent);
            const marker = L.marker([location.Latitude, location.Longitude])
                .addTo(map)
                .bindPopup(popupContent, {maxWidth: 300});

            marker.on('click', function() {
                console.log('Marker clicked:', location.Firm);
                this.openPopup();
            });

            markers.push(marker);

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = generateCardContent(location);
            card.addEventListener('click', () => {
                console.log('Card clicked:', location.Firm);
                map.setView(marker.getLatLng(), 15);
                marker.openPopup();
            });
            locationContainer.appendChild(card);
        } else {
            console.log('Location skipped (no coordinates):', location.Firm);
        }
    });
}
function applyFiltersAndSort(data) {
    const filterText = document.getElementById('filter').value.toLowerCase();
    const mosaicFilter = document.getElementById('mosaic-filter').checked;
    const stainedGlassFilter = document.getElementById('stained-glass-filter').checked;
    const sculptureFilter = document.getElementById('sculpture-filter').checked;
    const paintedMuralFilter = document.getElementById('painted-mural-filter').checked;
    const sortBy = document.querySelector('input[name="sort"]:checked')?.value;

    let filteredLocations = data.filter(location => {
        return (!filterText || (location.City && location.City.toLowerCase().includes(filterText))) &&
               (!mosaicFilter || location.Mosaic) &&
               (!stainedGlassFilter || location.StainedGlass) &&
               (!sculptureFilter || location.Sculpture) &&
               (!paintedMuralFilter || location.PaintedMural);
    });

    if (sortBy === 'name') {
        filteredLocations = filteredLocations.sort((a, b) => a.Firm.localeCompare(b.Firm));
    } else if (sortBy === 'date') {
        filteredLocations = filteredLocations.sort((a, b) => (a.DateAcquiredOrOpened || 0) - (b.DateAcquiredOrOpened || 0));
    }

    loadLocations(filteredLocations);
}

function generatePopupContent(location) {
    console.log('Generating popup content for:', location.Firm);
    let content = `<b>${location.Firm}</b><br>`;
    content += `<strong>City:</strong> ${location.City}, ${location.State}<br>`;
    if (location.DateAcquiredOrOpened) content += `<strong>Date Acquired/Opened:</strong> ${location.DateAcquiredOrOpened}<br>`;
    if (location.ArtConstructionDate) content += `<strong>Art Construction Date:</strong> ${location.ArtConstructionDate}<br>`;
    if (location.Mosaic) content += `<strong>Mosaic:</strong> ${location.MosaicDetails || 'Yes'}<br>`;
    if (location.StainedGlass) content += `<strong>Stained Glass:</strong> ${location.StainedGlassDetails || 'Yes'}<br>`;
    if (location.Sculpture) content += `<strong>Sculpture:</strong> ${location.SculptureDetails || 'Yes'}<br>`;
    if (location.PaintedMural) content += `<strong>Painted Mural:</strong> ${location.PaintedMuralDetails || 'Yes'}<br>`;
    if (location.FabricWork) content += `<strong>Fabric Work:</strong> Yes<br>`;
    if (location.Furnishings) content += `<strong>Furnishings:</strong> Yes<br>`;
    if (location.Subjects) content += `<strong>Subjects:</strong> ${location.Subjects}<br>`;
    if (location.WorkedOnBy) content += `<strong>Worked On By:</strong> ${location.WorkedOnBy}<br>`;
    if (location.StillExists !== undefined) content += `<strong>Still Exists:</strong> ${location.StillExists ? 'Yes' : 'No'}<br>`;
    console.log('Generated content:', content);
    return content.trim();
}

function generateCardContent(location) {
    let content = `
        <h3>${location.Firm}</h3>
        <p><strong>City:</strong> ${location.City}, ${location.State}</p>
        <p><strong>Date Acquired/Opened:</strong> ${location.DateAcquiredOrOpened || 'N/A'}</p>
        <p><strong>Art Construction Date:</strong> ${location.ArtConstructionDate || 'N/A'}</p>
    `;

    if (location.Mosaic) content += `<p><strong>Mosaic:</strong> ${location.MosaicDetails || 'Yes'}</p>`;
    if (location.StainedGlass) content += `<p><strong>Stained Glass:</strong> ${location.StainedGlassDetails || 'Yes'}</p>`;
    if (location.Sculpture) content += `<p><strong>Sculpture:</strong> ${location.SculptureDetails || 'Yes'}</p>`;
    if (location.FabricWork) content += `<p><strong>Fabric Work:</strong> Yes</p>`;
    if (location.Furnishings) content += `<p><strong>Furnishings:</strong> Yes</p>`;
    if (location.PaintedMural) content += `<p><strong>Painted Mural:</strong> ${location.PaintedMuralDetails || 'Yes'}</p>`;
    if (location.Subjects) content += `<p><strong>Subjects:</strong> ${location.Subjects}</p>`;
    if (location.WorkedOnBy) content += `<p><strong>Worked On By:</strong> ${location.WorkedOnBy}</p>`;
    if (location.ArchivalRecords) content += `<p><strong>Archival Records:</strong> ${location.ArchivalRecords}</p>`;

    return content;
}