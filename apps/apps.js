//Namespacing
const app = {};

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
        })
        .fail(function () {
            alert('Sorry, cities cannot be found');
        });
};

// app.getLatLng = (citiesArray) => {

// }
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
            console.log(`The air quality in ${city}, ${state} is ${response.data.current.pollution.aqius}. The current temperature is ${response.data.current.weather.tp} degrees Celcius.`);
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