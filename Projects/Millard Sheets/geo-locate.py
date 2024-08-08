import json
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

# Load your JSON data
with open('Millard_Sheets_Studio_Locations.json', 'r') as file:
    locations = json.load(file)

# Initialize geolocator
from geopy.geocoders import GoogleV3

# Replace 'YOUR_API_KEY' with your actual Google API key
geolocator = GoogleV3(api_key='AIzaSyCDTwZUYuRdIHpc9gbBvCqk82peuLY4fHk')

def get_lat_long(address):
    try:
        location = geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
        else:
            return None, None
    except GeocoderTimedOut:
        return None, None

# Add lat and long to each location
for location in locations:
    address = f"{location['Address']}, {location['City']}, {location['State']}"
    lat, lon = get_lat_long(address)
    location['Latitude'] = lat
    location['Longitude'] = lon

# Save the updated data back to a JSON file
with open('Millard_Sheets_Studio_Locations_With_Coordinates.json', 'w') as file:
    json.dump(locations, file, indent=4)

print("Geocoding complete. Check the new file for latitude and longitude data.")


