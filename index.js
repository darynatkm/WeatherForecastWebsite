
const API_KEY = '6a12ad79a8e23eacad69bb483b954736';
const errorMessage = document.getElementById("errorMessage");
const searchBar = document.getElementById("search");
const dateField = document.getElementById("currentDate");
const currentForecast = document.getElementById("currentForecast");
const hourlyForecast = document.getElementById("hourly")
const forecastDayCards = document.getElementById("forecastDayCards")
const weather5d = document.getElementById("weather5d")
const navLinks = document.querySelectorAll('.nav-link')
const currentWeatherBlock = document.getElementById("currentWeather")
const nearbyBlock = document.getElementById("nearby")
const hourlyForecast5 = document.getElementById("hourly5")
const block404 = document.getElementById("block404")
const hourlyBlock = document.getElementById("hourlyBlock")
const container = document.getElementById("container")
let lat,lon, url;


async function updateAll() {

    fetchCoordinates()
     .catch((error) => 
     console.error(error));

}

async function displayForecast5() {


    weather5d.style.display = 'flex';
    navLinks[0].classList.remove("active");
    navLinks[1].classList.add("active");
    currentWeatherBlock.style.display = 'none'
    nearbyBlock.style.display = 'none'
    

}

async function displayCurrentDay() {
    hourlyForecast.style.display = 'block'
}
async function fetchCoordinates() {

    // let data = fetchUrl(`https://api.bigdatacloud.net/data/reverse-geocode-client?`)
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?`)
    const data = await response.json();
    searchBar.value = data.city;
    lat = data.latitude; 
    lon = data.longitude;

    return fetchCurrentForecast();
}


async function fetchForecastBySearch() {


        let data = await (await (fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchBar.value}&limit=1&appid=${API_KEY}`)
        .then((response) => {

            console.log(response)
            if (response.ok) {
              return response.json();
            }
            else {
                console.log("error")
            }
            // throw new Error('Something went wrong');
          })  
          .catch(err => {
                console.log("IN")
                block404.style.display = 'block'
                currentWeatherBlock.style.display = 'none'
                nearbyBlock.style.display = 'none'
                hourlyBlock.style.display = 'none'
                container.style.height = '40rem'
                setTimeout(function(){
                    window.location.reload();
                 }, 3000);
                console.log('Error: ', err)
          })
        ))

    // const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchBar.value}&limit=1&appid=${API_KEY}`)

    lat = data[0].lat; 
    lon = data[0].lon;

    return fetchCurrentForecast();
}

async function fetchCurrentForecast() {

   
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchBar.value}&appid=${API_KEY}`)
    const data = await response.json();
    updateCurrentForecast(data);
    
    return fetchHourlyForecast()

    
}
async function fetchHourlyForecast() {


    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    const data = await response.json();
    console.log(data)
    updateHourlyForecast(data);  
          
    return fetch5DayForecast()
}

async function fetch5DayForecast() {
 
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    const data = await response.json();
    console.log(data)
    update5DayForecast(data);  
    
}


const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)

  }
 else {
    lat = "48.8534";
    lon = "2.3488";
  }
}

const showPosition = (position) => {
    lat = position.coords.latitude
    console.log(position.coords.latitude)
    lon = position.coords.longitude; 
}


const updateCurrentForecast = (data) => {

    getCurrentDate()

    currentForecast.innerHTML = `
                <div class="imageMain">
                    <img src='http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png' height="80px">
                    <p class="text-center">${data.weather[0].main}</p>
                </div>
                <div class="temp">
                    <p class="tempBig fs-1">${convertToCelsius(data.main.temp)}°C</p>
                    <p>Real Feel ${convertToCelsius(data.main.feels_like)}°C</p>
                </div>
                <div class="otherInfo">
                    <p>Sunrise: ${convertUnixToTime(data.sys.sunrise)}</p>
                    <p>Sunset: ${convertUnixToTime(data.sys.sunset)}</p>
                    <p>Duration: ${getDayDuration(convertUnixToTime(data.sys.sunset - data.sys.sunrise))} hr</p>
                </div>
    `
}

const getCurrentDate = () => {

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let currentDate = `${month}.${day}.${year}`;
    dateField.innerHTML = currentDate
}


const convertUnixToTime = (unix) => {
    let d = new Date(unix * 1000).toLocaleTimeString("en-US");
    return d
}

const convertToCelsius = (temp) => {
    return  Math.round(temp - 273.15);
}
const getDayDuration = (d) => {
    return d.substring(0, d.length-3)
}

const updateHourlyForecast = (data) => {
    hourlyForecast.innerHTML =`
        <div class="col-md-1">
            <p>Today</p>
            <div style="height: 100px"></div>
            <p>Forecast</p>
            <p>Temp(°C)</p>
            <p>RealFeel</p>
            <p>Wind (km/h)</p>
        </div>`
for (let index = 0; index < 6; index++) {
    addHourForecast(data.list[index])
    
}
}

const addHourForecast = (item) => {
    hourlyForecast.innerHTML +=`
    <div class="col-md-1 text-center">
        <p>${item.dt_txt.substring(10, 16)}</p>
        <img class="img-fluid" src='http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png'></img>
        <p>${item.weather[0].main}</p>
        <p>${convertToCelsius(item.main.temp)}°C</p>
        <p>${convertToCelsius(item.main.feels_like)}°C</p>
        <p>${item.wind.gust} ESE</p>
    </div>`
}
const update5DayForecast = (data) => {
    
    if( data.list[0].dt_txt.substring(11, 13) > 12) {
        forecastDayCards.innerHTML =`
        <div class="col bg-white p-3 text-center" onclick = "getHourlyForecast5(${data.list[0].dt})">
            <h3 class="text-uppercase fs-3">${data.list[0].dt_txt.substring(5, 11)}</h3>
            <img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png" alt="">
            <p>${convertToCelsius(data.list[0].main.temp)}°C</p>
            <p>${data.list[0].weather[0].main}</p>
        </div>`
    }

    let filteredForecasts = [];

    for (let index = 0; index < data.list.length; index++) {
        for (let i = 0; i < prepare5DayArray().length; i++) {
            if (data.list[index].dt_txt == prepare5DayArray()[i]) {
                filteredForecasts.push(data.list[index])
            }
            
        }
        
    } 

    for (let index = 0; index < 5; index++) {
        add5dayForecast(filteredForecasts[index])
    
    }

    
    
}

const add5dayForecast = (item) => {


        forecastDayCards.innerHTML +=`
            <div class="col bg-white p-3 text-center" onclick="getHourlyForecast5(${item.dt})">
                <h3 class="text-uppercase fs-3">${item.dt_txt.substring(5, 11)}</h3>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="">
                <p>${convertToCelsius(item.main.temp)}°C</p>
                <p>${item.weather[0].main}</p>
            </div>
        `
}

const prepare5DayArray = () => {


    let actualDate = new Date();


    let dateArr = [transformDate(actualDate)]
    
    for (let i = 1; i < 6; i++){
     dateArr.push(transformDate(new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate()+i)))
    }
    return dateArr

}

const transformDate = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (month < 10){
        if(day < 10){
            return `${year}-0${month}-0${day} 12:00:00`;
        }
        else {
            return `${year}-0${month}-${day} 12:00:00`;     
        }
    } else {
        return `${year}-${month}-${day} 12:00:00`;  
    }

}

const getHourlyForecast5 = (unix) => {

    hourlyForecast.style.display = 'none'
    //should start with 9 AM 
    unix -= 10800
    let hourlyForecasts5 = []
    for (let index = 0; index < 6; index++) {
        hourlyForecasts5.push(unix + 10800*index)
        
    }
    console.log(hourlyForecasts5)
    return fetchHourlyForecast5(hourlyForecasts5)    
}

async function fetchHourlyForecast5(arr5) {

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    const data = await response.json();

    let filteredHourlyForecasts = []
    for (let index = 0; index < data.list.length; index++) {
        for (let i = 0; i < arr5.length; i++) {
            if (data.list[index].dt == arr5[i]) {
                filteredHourlyForecasts.push(data.list[index])
            }
            
        }
        
    } 
    hourlyForecast5.innerHTML =`
    <div class="col-md-1">
        <p>Today</p>
        <div style="height: 100px"></div>
        <p>Forecast</p>
        <p>Temp(°C)</p>
        <p>RealFeel</p>
        <p>Wind (km/h)</p>
    </div>`
    for (let index = 0; index < 6; index++) {
        add5dayForecastHourly(filteredHourlyForecasts[index])
    
    }
    
}

const add5dayForecastHourly = (item) => {


    hourlyForecast5.innerHTML +=`
        <div class="col-md-1 text-center">
            <p>${item.dt_txt.substring(10, 16)}</p>
            <img class="img-fluid" src='http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png'></img>
            <p>${item.weather[0].main}</p>
            <p>${convertToCelsius(item.main.temp)}°C</p>
            <p>${convertToCelsius(item.main.feels_like)}°C</p>
            <p>${item.wind.gust} ESE</p>
        </div>`
    
}

