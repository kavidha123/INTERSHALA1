document.getElementById('searchBtn').addEventListener('click', () => fetchWeather(document.getElementById('cityInput').value));
document.getElementById('currentLocationBtn').addEventListener('click', fetchCurrentLocationWeather);

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

function updateRecentSearches() {
    const recentSearchesEl = document.getElementById('recentSearches');
    if (recentCities.length === 0) return;

    let dropdownHTML = `
        <select id="cityDropdown" class="p-3 border rounded w-full mt-4">
            <option>Select a recent city</option>
            ${recentCities.map(city => `<option value="${city}">${city}</option>`).join('')}
        </select>
    `;
    recentSearchesEl.innerHTML = dropdownHTML;
    document.getElementById('cityDropdown').addEventListener('change', (e) => {
        if (e.target.value !== 'Select a recent city') {
            fetchWeather(e.target.value);
        }
    });
}

async function fetchWeather(city) {
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=9c029c17ba39171de0650d1f5376a96c&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeather(data);
        updateRecentCities(city);
    } catch (error) {
        alert(error.message);
    }
}

function fetchCurrentLocationWeather() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=9c029c17ba39171de0650d1f5376a96c&units=metric`);
            if (!response.ok) throw new Error('Location not found');
            const data = await response.json();
            displayWeather(data);
            updateRecentCities(data.name);
        } catch (error) {
            alert(error.message);
        }
    });
}

function displayWeather(data) {
    document.getElementById('location').textContent = data.name + " (" + new Date().toISOString().split('T')[0] + ")";
    document.getElementById('temperature').textContent = data.main.temp;
    document.getElementById('wind').textContent = data.wind.speed;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('weatherIcon').innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon">`;

    // Fetch and display 5-day forecast
    fetchForecast(data.coord.lat, data.coord.lon);
}

async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=9c029c17ba39171de0650d1f5376a96c&units=metric`);
        if (!response.ok) throw new Error('Forecast data not found');
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        alert(error.message);
    }
}

function displayForecast(data) {
    const forecastEl = document.getElementById('forecast');
    forecastEl.innerHTML = '';
    data.list.slice(0, 5).forEach(item => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'p-3 bg-blue-100 rounded text-center';
        forecastItem.innerHTML = `
            <p class="font-bold">${item.dt_txt.split(' ')[0]}</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather icon" class="mx-auto">
            <p>Temp: ${item.main.temp}°C</p>
            <p>Wind: ${item.wind.speed} M/S</p>
            <p>Humidity: ${item.main.humidity}%</p>
        `;
        forecastEl.appendChild(forecastItem);
    });
}

function updateRecentCities(city) {
    if (recentCities.includes(city)) return;
    recentCities = [city, ...recentCities].slice(0, 5); // Keep only the last 5 cities
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateRecentSearches();
}

updateRecentSearches();
