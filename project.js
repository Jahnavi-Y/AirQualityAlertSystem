const apiKey = '6f1843023774fd2dca9e0a43d362668f'; // Replace with your OpenWeatherMap API key

// Add event listener for fetching data when the button is clicked
document.getElementById('getLocationBtn').addEventListener('click', () => {
    document.getElementById('airQualityInfo').classList.remove('hidden');
    document.getElementById('location').innerText = 'Fetching...';
    document.getElementById('aqi').innerText = '-';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getAirQualityData, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Fetch air quality data when location is fetched
function getAirQualityData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Use OpenWeatherMap Reverse Geocoding API to get the location name (city)
    const geocodingUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(locationData => {
            const cityName = locationData.name || "Unknown Location"; // Ensure to get city name correctly
            getAirQuality(cityName, lat, lon);
        })
        .catch(error => {
            console.error('Error fetching location data:', error);
            alert('Unable to retrieve location data.');
        });
}

// Fetch air quality data based on location and display it
function getAirQuality(cityName, lat, lon) {
    const apiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayAirQuality(data, cityName);
        })
        .catch(error => {
            console.error('Error fetching air quality data:', error);
            alert('Unable to retrieve air quality data.');
        });
}

// Function to display the air quality info on the page
function displayAirQuality(data, cityName) {
    const aqi = data.list[0].main.aqi;
    const locationText = `City: ${cityName}`;
    const aqiText = getAqiText(aqi);

    document.getElementById('location').innerText = locationText;
    document.getElementById('aqi').innerText = `${aqi} (${aqiText})`;

    // Show alert if AQI is poor (AQI > 3)
    if (aqi > 3) { // AQI > 3 is considered poor
        document.getElementById('alert').classList.remove('hidden');
    } else {
        document.getElementById('alert').classList.add('hidden');
    }
}

// Function to map AQI values to their corresponding text
function getAqiText(aqi) {
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Fair';
    if (aqi === 3) return 'Moderate';
    if (aqi === 4) return 'Poor';
    if (aqi === 5) return 'Very Poor';
    return 'Unknown';
}

// Error handling for geolocation API
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        default:
            alert("An unknown error occurred.");
            break;
    }
}

// Set interval to refresh air quality data every 10 minutes (600000 milliseconds)
let refreshInterval = setInterval(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getAirQualityData, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}, 600000); // 600000 ms = 10 minutes  