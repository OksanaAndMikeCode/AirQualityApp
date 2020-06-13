//Namespacing
const app = {};

// Creating an object to store all data on the chosen city
app.dataObj = {};

// Creating an array to store latitude and longitude of all cities in the chosen province
app.latLngArray = [];
// MC JN-12 - 21:20: changed the name above because it was capitalized 'LatLng'

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
    // console.log('Yay, I got a response', response.data[0]);
    // const provResp = response.data[0].city;
    const citiesArray = [];
    response.data.forEach((arrayItem) => {
      citiesArray.push(arrayItem.city);
      $('ul').append(`<li><span class="fa fa-square-o"></span>${arrayItem.city}</li>`);
      // console.log(arrayItem.city);
    });
    // console.log(citiesArray);

    // MC 06-13 12:15: MAYBE THIS CAN BE DONE CLEANER, BUT IT'S WORKING NOW
    // const citiesStringArray = [];
    // const joinStrArr = [];

    // MC 06-13 12:15: push '+' between each city (to be removed), so as not to confuse with ','
    // citiesStringArray.push(citiesArray.join('+'));

    // MC 06-13 12:15: push one abbreviation to end of array, because last item did not have a comma at the end, therefore was not receiving abbreviation
    // citiesStringArray.push(`${abbreviation}`);

    // MC 06-13 12:15: NEW ARRAY -joinStrArray- pull from OLD ARRAY split at '+' and add `,${abbreviation}&`
    // joinStrArr.push(citiesStringArray.join().split('+').join(`,${abbreviation}&`));
    // app.getLonLat(citiesJoined);

    // getting latitude and longitude of every city in the cities array by making an ajax call to MapQuest API
    citiesArray.forEach((city) => {

        // OS JN-13 - 11:19: changed to previous state so that we can see popups
        app.getLatLng(`${city},${abbreviation}`);

        //   app.getLatLng((`${city},${abbreviation}&`).split(' ').join('+'));
        // MC JN-12 - 21:20: this hasn't been completed

        // console.log(citiesStringArray);
        // console.log(joinStrArr);

        // getting latitude and longitude of every city in the cities array by making an ajax call to MapQuest API
        // joinStrArr.forEach((str) => {
        // MC 06-13 12:15: now this deconstructs array (with one string item) and sends it to getLatLng
        // app.getLatLng(str);
      })
      .fail(function () {
        alert('Sorry, cities cannot be found');
      });
  });
}

let loc;
let lat;
let lng;
// MC JN-12 - 21:20: amended latitude and longitude names to be shorter
app.getLatLng = (citiesString) => {
  $.ajax({
      url: "http://www.mapquestapi.com/geocoding/v1/batch",
      method: 'GET',
      dataType: 'json',
      data: {
        key: app.mapApiKey,
        location: citiesString,
      }
    })
    .then(function (response) {
      // got a precise response
      loc = response.results[0].providedLocation.location;
      lat = response.results[0].locations[0].displayLatLng.lat;
      lng = response.results[0].locations[0].displayLatLng.lng;
      // MC JN-12 - 21:20: renamed loc, lat, lng


      // pushes response into an array as objects
      app.latLngArray.push({
        loc,
        lat,
        lng
      });
      // MC JN-12 - 21:20: put results into an object, and they are pushed to the array for easier deconstructing

      // MC JN-12 - 21:20: started to create a function to push relevant information into a popup
      // app.displayPopup();

      // OS JN-13 - 11:17: adding popups of cities in the selected province using the lat lng data received from mapquest  
      for (let i = 0; i < app.latLngArray.length; i++) {
        // console.log(i);
        L.marker([app.latLngArray[i].lat, app.latLngArray[i].lng]).addTo(map)
          .bindPopup(app.latLngArray[i].loc)
          .openPopup()
      }
      console.log(`${loc}: Latitude is ${lat}, longitude is ${lng}`);
    })
    .fail(function () {
      console.log('Lat Lng Response failed');
    });
};

// app.displayPopup = function(response) {
//   console.log(response);

//   L.marker([`${lat}, ${lng}`]).bindPopup(`${chosenCity}${dataObj}`);
// };

let abbreviation;
// creating a function to get the chosen province name abbreviation
app.getProvinceAbbrev = function () {
  abbreviation = $('.province').children("option:selected").text();
  return abbreviation;
}

// creating a function to pass the clicked city to the API for Air Quality
app.grabLiText = function () {
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


// OS JN-13 - 11:17: declared map in the global scope so that other functions can access it
let map;

//Creating an init function
app.init = function () {
  $(".province").change(app.getProvinceAbbrev);
  $(".province").change(app.grabInput);
  $('ul').on('click', 'li', app.grabLiText);



  $.getJSON("../assets/provGeo.json", function (data) {
    L.geoJson(data, {
      onEachFeature: function(feature, featureLayer) {
        // MC 06-13 09:30: the following uses data stored in the json file to create a popup with province name attached
        // in this case, PRENAME will be 'Ontario', but we can also use 'O.N.', which we could edit (in the file) to be 'ON'.
        featureLayer.bindPopup(feature.properties.PRENAME);
        // console.log(feature, featureLayer, feature.properties.PRENAME);
        },
        // MC 06-13 09:30: change color of layer and line weight
        style: function() {
          return {
            color: '#000',
            weight: 0.5
          }
        }
  }).addTo(map);
});

  /////////////////////////
  // LEAFLET MAP: INITIALIZATION
  map = L.map('map').setView([60, -95], 4);

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

  // OS JN-13 - 11:26: trying to make markers react on click, no results so far
  // $('map').on('click', console.log('hello'));
  $('L.marker').on("click", console.log('hello'));
};

//Creating document ready
$(document).ready(function () {
  app.init();
});