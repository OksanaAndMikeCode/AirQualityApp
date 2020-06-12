//Namespacing
const app = {};

// Creating an object to store all data on the chosen city
app.dataObj = {};

// Creating an array to store latitude and longitude of all cities in the chosen province
app.LatLngArray = [];

//Storing api key in a variable
app.airApiKey = '69bdebb7-8ed2-400a-bcd2-24b56bacb155';
app.mapApiKey = 'EPSBNGNeFxHPINGRYzr7X1Sgyh8vyQpV';

// Consumer Secret: JuWwJGHxstRmxJUj

//Creating a function for making a call to the Visual Air Api (aka ajax call) to get the cities array
app.getCitiesArray = (state) => {
    $.ajax({
            url: `https://api.airvisual.com/v2/cities`,
            method: 'GET',
            dataType: 'json',
            data: {
                state: state,
                country: 'Canada',
                key: app.airApiKey,
            }
        }).then(function (response) {
            console.log('Yay, I got a response', response.data[0]);
            // const provResp = response.data[0].city;
            const citiesArray = [];
            response.data.forEach((arrayItem) => {
                citiesArray.push(arrayItem.city);
                $('ul').append(`<li><span class="fa fa-square-o"></span>${arrayItem.city}</li>`);
                // console.log(arrayItem.city);
            });
            console.log(citiesArray.join(`,${abbreviation},`));
                // app.getLonLat(citiesJoined);
            // getting latitude and longitude of every city in the cities array by making an ajax call to MapQuest API
            citiesArray.forEach ((city) => {
                app.getLatLng(`${city},${abbreviation}`);
            });
            console.log(app.LatLngArray);
        })
        .fail(function () {
            alert('Sorry, cities cannot be found');
        });
};

let latitude;
let longitude;
app.getLatLng = (citiesString) => {
    $.ajax({
        url: "http://www.mapquestapi.com/geocoding/v1/batch",
        method: 'GET',
        dataType: 'json',
        data: {
            key: app.mapApiKey,
            location: citiesString,
        }
    }).then(function(response) {
        // got a precise response
        latitude = response.results[0].locations[0].displayLatLng.lat;
        longitude = response.results[0].locations[0].displayLatLng.lng;

        app.LatLngArray.push(response.results[0].providedLocation.location, latitude, longitude);
        latitude = response.results[0].locations[0].displayLatLng.lat;
        longitude = response.results[0].locations[0].displayLatLng.lng;
        console.log(`${response.results[0].providedLocation.location}: Latitude is ${response.results[0].locations[0].displayLatLng.lat}, longitude is ${response.results[0].locations[0].displayLatLng.lng}`);
    })
    .fail(function() {
        console.log('Lon Lat Response failed');
    });
};

let abbreviation;
// creating a function to get the chosen province name abbreviation
app.getProvinceAbbrev = function() {
    abbreviation = $('.province').children("option:selected").text();
    return abbreviation;
}

// creating a function to pass the clicked city to the API for Air Quality
app.grabLiText = function() {
    let chosenCity = $(this).text();
    console.log(chosenCity);
    app.getCityData(chosenCity, selectedProvince);
};


//Creating a function for making a call to the Visual Air Api (aka ajax call) to get data on a specific city
app.getCityData = (city, state) => {
    $.ajax({
            url: `https://api.airvisual.com/v2/city`,
            method: 'GET',
            dataType: 'json',
            data: {
                city: city,
                state: state,
                country: 'Canada',
                key: app.airApiKey,
            }
        }).then(function (response) {
            app.dataObj = {
                city: city,
                province: state,
                pollution: response.data.current.pollution.aqius,
                temperature: response.data.current.weather.tp,
                humidity: response.data.current.weather.hu,
                precipitation: response.data.current.weather.pr,
                wind: response.data.current.weather.wd,
                windSpeed: response.data.current.weather.ws,
                lat: response.data.location.coordinates[1],
                lng: response.data.location.coordinates[0],
            };
            console.log(`The air quality in ${city}, ${state} is ${response.data.current.pollution.aqius}. The current temperature is ${response.data.current.weather.tp} degrees Celcius.`);
            console.log(app.dataObj);
        })
        .fail(function () {
            alert('Sorry, your city cannot be found');
        });
};

let selectedProvince;
app.grabInput = () => {
    selectedProvince = $('.province').children("option:selected").val();
    alert("You have selected the province - " + selectedProvince);
    console.log(selectedProvince);
    app.getCitiesArray(selectedProvince);
    // app.getCityData('Toronto', selectedProvince);


};


//Creating an init function
app.init = function () {
    $(".province").change(app.getProvinceAbbrev);
    $(".province").change(app.grabInput);
    $('ul').on('click', 'li', app.grabLiText);


    /////////////////////////
    // LEAFLET MAP
    const map = L.map('map').setView([58, -100], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([55, -100]).addTo(map)
        .bindPopup('Canada.<br> Air Quality App.')
        .openPopup();

    L.marker([43.651893, -79.381713]).addTo(map)
        .bindPopup('Toronto')
        .openPopup();

    L.marker([45.420421, -75.692432]).addTo(map)
        .bindPopup('Ottawa')
        .openPopup();

    L.marker([49.900496, -97.139309]).addTo(map)
        .bindPopup('Winnipeg')
        .openPopup();
    /////////////////////////

};

//Creating document ready
$(document).ready(function () {
    app.init();
});