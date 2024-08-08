const apiKey = '5aeb33e759a140ada81140327232001';

const form = document.querySelector('#form');
const currentButton = document.querySelector('#current_btn');
const inputField = document.querySelector('#city');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const cityInput = document.querySelector('#city');
  const cityName = cityInput.value.trim();
  // validate input field
  if (cityName === '') {
    alert('Please Enter City Name to get Weather!');
    return;
  }

  const regex = /\d/;
  if (regex.test(cityName)) {
    alert(
      'CityName should not contain any Number Value, please provide String'
    );
    return;
  }
  cityInput.value = '';
  fetchWeatherData(cityName);
  fetchForecastWeatherData(cityName);
  addToSearchHistory(cityName);
});

// function to fetch current weatherData
async function fetchWeatherData(cityName) {
  const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}&aqi=no`;
  // try and catch block to catch error
  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
    });
    // checking if res is ok or not
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const data = await res.json();

    //function to create dynamic UI element
    createUI(data);
  } catch (error) {
    console.log(`${error.message}`);
  }
}

function createUI(data) {
  // clear input field
  document.querySelector('#city').value = '';
  // updating location and date
  const h2 = document.querySelector('#title');
  h2.textContent = data.location.name;

  const span = document.querySelector('#date');
  const date = data.location.localtime.split(' ');
  span.textContent = `(${date[0]})`;

  // updating temp, wind & humidity
  const temp = document.querySelector('#temp');
  temp.textContent = `Temperature: ${data.current.temp_c}°C`;

  const wind = document.querySelector('#wind');
  wind.textContent = `Wind: ${data.current.wind_kph} km/h`;

  const humidity = document.querySelector('#humidity');
  humidity.textContent = `Humidity: ${data.current.humidity} %`;

  // updating Icon
  const icon = document.querySelector('#icon');
  icon.innerHTML = '';
  const img = document.createElement('img');
  img.setAttribute('src', data.current.condition.icon);
  icon.appendChild(img);

  const condition = document.querySelector('#condition');
  condition.textContent = data.current.condition.text;
}

// fuction to fetch forecast weather data for upto 5 days
async function fetchForecastWeatherData(cityName) {
  const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=5&aqi=no&alerts=no`;

  // try and catch block to catch error
  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
    });
    // checking if res is ok or not
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const data = await res.json();
    const foreCastDays = data.forecast.forecastday;

    // Clear previous results
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';

    foreCastDays.forEach((day) => {
      // Function to create dynamic UI element
      createCardUI(day);
    });
  } catch (error) {
    console.log(`${error.message}`);
  }
}

function createCardUI(data) {
  const card = document.createElement('div');
  card.className =
    'flex flex-col sm:items-center gap-3 bg-gray-500 text-white w-full sm:w-52 h-fit p-2 rounded-md';

  card.innerHTML = `
    <span class="font-bold text-lg sm:text-3xl text-white inline-block">
     (${data.date})
    </span>
    <span class="block text-3xl">
      <img src=${data.day.condition.icon} alt="Weather icon"/>
    </span>
    <div class="flex flex-col gap-2">
      <p class="text-white font-semibold text-base sm:text-lg">
       AvgTempe: ${data.day.avgtemp_c} <sup>o</sup>C
      </p>
      <p class="text-white font-semibold text-base sm:text-lg">
        AvgWind: ${data.day.avgvis_km} km/h
      </p>
      <p class="text-white font-semibold text-base sm:text-lg">
        AvhHumidity: ${data.day.avghumidity} %
      </p>
    </div>
  `;

  document.getElementById('cards').appendChild(card);
}

// click event for current location
currentButton.addEventListener('click', getCurrentLocation, { once: true });

// get Current location
function getCurrentLocation() {
  if (window.navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      doSomething(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.log(error);
  }
}

async function doSomething(lati, long) {
  // try and catch block to catch error
  try {
    const res = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=5aeb33e759a140ada81140327232001&q=${lati},${long}&days=5&aqi=no&alerts=no`,
      {
        method: 'GET',
      }
    );
    // checking if res is ok or not
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const data = await res.json();
    createUI(data);
    const foreCastDays = data.forecast.forecastday;

    // Clear previous results
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';

    foreCastDays.forEach((day) => {
      // Function to create dynamic UI element
      createCardUI(day);
    });
  } catch (error) {
    console.log(`${error.message}`);
  }
}

// Call this function when browser load
window.onload = getCurrentLocation();

// Implementing dropdown
function addToSearchHistory(cityName) {
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  if (!searchHistory.includes(cityName)) {
    searchHistory.push(cityName);
    if (searchHistory.length > 5) {
      searchHistory.shift();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }
  if (searchHistory.length > 0) {
    displaySearchHistory();
  }
}

function displaySearchHistory() {
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const historyList = document.getElementById('dropdown');
  historyList.innerHTML = '';

  searchHistory.forEach((city) => {
    const listItem = document.createElement('li');
    listItem.className =
      'p-2 cursor-pointer hover:bg-[#f0f0f0] text no-underline';
    listItem.textContent = city;

    listItem.addEventListener('click', () => {
      inputField.value = city;
      fetchWeatherData(city);
      fetchForecastWeatherData(city);
    });

    historyList.appendChild(listItem);
  });
}

inputField.addEventListener('input', () => {
  document.getElementById('dropdown').style.display = 'block';
});

inputField.addEventListener('focusout', () => {
  setTimeout(() => {
    document.getElementById('dropdown').style.display = 'none';
  }, 200);
});
