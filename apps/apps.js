//Namespacing
const app = {};

//Storing api keys in variables
app.airApiKey = '69bdebb7-8ed2-400a-bcd2-24b56bacb155';
app.mapApiKey = 'EPSBNGNeFxHPINGRYzr7X1Sgyh8vyQpV';
app.unsplashApiKey = 'Ro76YKYpmutB58ImuEKT8izDBYKA669WYcjJWz-U6TA';

// Leaflet map variables
app.map; 
app.markerGroup;

// An object to store all data on the chosen city
app.dataObj = {};

// Variables for Unsplash results
app.unsplashUrl;
app.altTag;

// An array to store latitude and longitude of all cities in the chosen province
app.latLngArray = [];
let abbreviation;

// A call to the Visual Air Api to get the province cities array
app.getCitiesArray = (state) => {
  $.ajax({
    url: 'https://proxy.hackeryou.com',
    method: 'GET',
    dataType: 'json',
    data: {
      reqUrl: `https://api.airvisual.com/v2/cities`,
      params: {
        state: state,
        country: 'Canada',
        key: app.airApiKey,
      },
      proxyHeaders: {
        'Some-Header': 'goes here'
      },
      xmlToJSON: false,
      useCache: false
    }
  }).then(function (response) {
    const citiesArray = [];
    response.data.forEach((arrayItem) => {
      citiesArray.push(arrayItem.city);
    });
    
    const pushLocEq = [];
    const mapQString = [];

    // BEFORE SUBMISSION: remove the shift and the "&location=" in the URL API call. 
    // MC JN-13 15:45: Shift the first element of the returned array so that it doesn't receive "location=" as it will break the API call. It will be unshifted after the following forEach.
    const shiftCity = citiesArray.shift();
    console.log(shiftCity);

    // MC JN-13 15:45: append the abbreviation to shiftCity and rename it firstCity
    const firstCity = (`${shiftCity},${abbreviation}`);
    console.log(firstCity);

    // MC JN-13 15:45: Loop to add "location=" in front of each city, and abbreviation behind
    citiesArray.forEach((city) => {
      pushLocEq.push(`location=${city},${abbreviation}`);
    });

    console.log(pushLocEq);

    // MC JN-13 15:45: put the firstCity back in front before adding "&" between everything
    pushLocEq.unshift(firstCity);
    console.log(pushLocEq);

    mapQString.push(pushLocEq.join(`&`));

    console.log(mapQString);

    // getting latitude and longitude of every city in the cities array by making an ajax call to MapQuest API
    app.getLatLng(mapQString);
    })
  .fail(function () {
    swal({
      title: 'Air quality is so good here that there is no need to measure it'
    })
  });
}

app.getLatLng = (citiesString) => {
  // BEFORE SUBMISSION: remove the shift from above and the "&location=" in the URL below. 
  $.ajax({
      url: 'https://proxy.hackeryou.com',
      method: 'GET',
      dataType: 'json',
      data: {
        reqUrl: `https://www.mapquestapi.com/geocoding/v1/batch?key=${app.mapApiKey}&location=${citiesString}`,
        proxyHeaders: {
          'Some-Header': 'goes here'
        },
        xmlToJSON: false,
        useCache: false
      }
    })
    .then(function (response) {
      let loc;
      let lat;
      let lng;
      for (i = 0; i < response.results.length; i++) {
        loc = response.results[i].locations[0].adminArea5;
        lat = response.results[i].locations[0].displayLatLng.lat;
        lng = response.results[i].locations[0].displayLatLng.lng;
        app.latLngArray.push({
          loc,
          lat,
          lng
        });
      }
      // Adding popups of cities in the selected province using the lat lng data received from mapquest  
      for (let i = 0; i < app.latLngArray.length; i++) {
        app.markerGroup = L.marker([app.latLngArray[i].lat, app.latLngArray[i].lng])
          .bindPopup(app.latLngArray[i].loc)
          .openPopup()
          .addTo(app.map)
          .on('click', function () {
            const clickedCity = app.latLngArray[i].loc;
            app.grabMarker(clickedCity);
          });
      }
    })
    .fail(function () {
      console.log('Lat Lng Response failed');
    });
};

// getting a random image from Unsplash API
app.getImages = (photoLocation) => {
  $.ajax({
    url: 'https://proxy.hackeryou.com',
    method: 'GET',
    dataType: 'json',
    data: {
      reqUrl: `https://api.unsplash.com/photos/random`,
      params: {
        client_id: app.unsplashApiKey,
          query: `${photoLocation} landscape`,
          orientation: 'landscape',
      },
      proxyHeaders: {
        'Some-Header': 'goes here'
      },
      xmlToJSON: false,
      useCache: false
    }
  }).then(function (response) {
      app.unsplashUrl = response.urls.regular;
      app.altTag = response.alt_description;
  })
};

// A call to the Visual Air Api to get data on a specific city
app.getCityData = (city, state) => {
  $.ajax({
      url: 'https://proxy.hackeryou.com',
      method: 'GET',
      dataType: 'json',
      data: {
        reqUrl: `https://api.airvisual.com/v2/city`,
        params: {
          city: city,
          state: state,
          country: 'Canada',
          key: app.airApiKey,
        },
        proxyHeaders: {
          'Some-Header': 'goes here'
        },
        xmlToJSON: false,
        useCache: false
      }
    }).then(function (response) {
      app.dataObj = {
        city: city,
        province: state,
        pollution: response.data.current.pollution.aqius,
        temperature: response.data.current.weather.tp,
        humidity: response.data.current.weather.hu,
        windSpeed: response.data.current.weather.ws,
      };
      console.log(`The air quality in ${city}, ${state} is ${response.data.current.pollution.aqius}. The current temperature is ${response.data.current.weather.tp} degrees Celcius.`);
      console.log(app.dataObj);
      // variable to store info that will be appended on click
      const appendInfo = `
      <div class="airInfo">
        <h3 class="location">${app.dataObj.city}, ${app.dataObj.province}</h3>
        <img class="weatherIcon" src="./assets/${response.data.current.weather.ic}.svg" alt="Weather icon">
        <h4 class="pollution">AirQI ${response.data.current.pollution.aqius}</h4>
        <h4 class="temperature"><i class="wi wi-thermometer"></i> ${response.data.current.weather.tp}<i class="wi wi-celsius"></i></h4>
        <h4 class="humidity"><i class="wi wi-humidity"></i> ${response.data.current.weather.hu}</h4>
        <h4 class="wind"><i class="wi wi-wind-direction"></i> ${response.data.current.weather.ws} m/s</h4>
        <img class="unsplashImg" src="${app.unsplashUrl}" alt="${app.altTag}">
      </div>`;
      // making aside visible to the user
      $('aside').show().html(appendInfo);
    })
    .fail(function () {
      swal({
        title: 'Sorry, air quality data on your city cannot be found',
      })
    });
};

// Passing the clicked marker to Air Visual API to get the date in the clicked city
app.grabMarker = function (marker) {
  app.getCityData(marker, provClicked);
};

//////////////////////////////////////
// LEAFLET IMPLEMENTATION

app.leafletMap = () => {

  /////////////////////////
  // LEAFLET MAP: INITIALIZATION
  app.map = L.map('map').setView([60, -95], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(app.map);

  const getGeoJson = "../assets/provGeo.json";

  $.getJSON(getGeoJson, function (data) {

    L.geoJson(data, {
      onEachFeature: function (feature, featureLayer) {
        // MC JN-13 20:15: the onClick event listener
        featureLayer.on('click', function () {
          provClicked = feature.properties.PRENAME;
          abbreviation = feature.properties.PREABBR;
          // making Air Visual API call using the clicked province
          app.getCitiesArray(provClicked);
          // making Unsplash API call using the clicked province
          app.getImages(provClicked);
          // hiding aside once the user clicks on the province
          $('aside').hide();
      });
        featureLayer.bindPopup(feature.properties.PRENAME);
      },
        // onEachFeature: function style(feature) {
        //   return {
        //     fillColor: feature.properties.ALBERTA,
        //     weight: 2,
        //     opacity: 0.5,
        //     color: 'white',
        //     dashArray: '3',
        //     fillOpacity: 0.3
        //   };
        // }
        // L.geoJson(data, {style: style}).addTo(app.map);
       
      // MC 06-13 09:30: change color of layer and line weight
      // STYLE IS NOT APPENDING
      style: function (feature, featureLayer) {
        return {
          color: '#257eca',
          weight: 0.5
        }
      }
    }).addTo(app.map);
  });
  L.marker([49.8951, -97.1384]).addTo(app.map).bindPopup('Manitoba').openPopup();
  L.marker([43.6532, -79.3832]).addTo(app.map).bindPopup('Ontario').openPopup();
  L.marker([64.2823, -135.0000]).addTo(app.map).bindPopup('Yukon').openPopup();
  L.marker([64.8255, -124.8457]).addTo(app.map).bindPopup('Northwest Territories').openPopup();
  L.marker([46.5107, -63.4168]).addTo(app.map).bindPopup('Prince Edward Island').openPopup();
  L.marker([53.1355, -57.6604]).addTo(app.map).bindPopup('Newfoundland and Labrador').openPopup();
  L.marker([46.8139, -71.2080]).addTo(app.map).bindPopup('Quebec').openPopup();
  L.marker([53.9333, -116.5765]).addTo(app.map).bindPopup('Alberta').openPopup();
  L.marker([52.9399, -106.4509]).addTo(app.map).bindPopup('Saskatchewan').openPopup();
  L.marker([70.2998, -83.1076]).addTo(app.map).bindPopup('Nunavut').openPopup();
  L.marker([44.6820, -63.7443]).addTo(app.map).bindPopup('Nova Scotia').openPopup();
  L.marker([46.5653, -66.4619]).addTo(app.map).bindPopup('New Brunswick').openPopup();
  L.marker([53.7267, -127.6476]).addTo(app.map).bindPopup('British Columbia').openPopup();
}

// Getting browser geolocaion 
app.getCurrentLocation = function() {
  $('aside').hide();
  navigator.geolocation.getCurrentPosition(function(location) {
      let currentLat;
      let currentLng;
      currentLat = location.coords.latitude;
      currentLng = location.coords.longitude;
       // creating a popup for current location
       L.marker([currentLat, currentLng]).addTo(app.map)
       .bindPopup('You are here!')
       .openPopup()
      app.getCurrentAirData(currentLat, currentLng);
  });
};

// A call to the Visual Air Api to get data on the current location
app.getCurrentAirData = (latitude, longitude) => {
  $.ajax({
      url: 'https://proxy.hackeryou.com',
      method: 'GET',
      dataType: 'json',
      data: {
        reqUrl: `https://api.airvisual.com/v2/nearest_city`,
        params: {
          lat: latitude,
          lon: longitude,
          key: app.airApiKey,
        },
        proxyHeaders: {
          'Some-Header': 'goes here'
        },
        xmlToJSON: false,
        useCache: false
      }
    }).then(function (response) {
      const appendInfo = `
      <div class="airInfo">
        <h3 class="location">Your Place</h3>
        <img class="weatherIcon" src="./assets/${response.data.current.weather.ic}.svg" alt="Weather icon">
        <h4 class="pollution">AirQI ${response.data.current.pollution.aqius}</h4>
        <h4 class="temperature"><i class="wi wi-thermometer"></i> ${response.data.current.weather.tp}<i class="wi wi-celsius"></i></h4>
        <h4 class="humidity"><i class="wi wi-humidity"></i> ${response.data.current.weather.hu}</h4>
        <h4 class="wind"><i class="wi wi-wind-direction"></i> ${response.data.current.weather.ws} m/s</h4>
      </div>`;
      $('aside').show().html(appendInfo);
      console.log(response.data.city, response.data.state, response.data.current.weather, response.data.current.pollution);
    })
    .fail(function () {
      swal({
        title: 'Sorry, unable to retrieve your location'
      })
    });
};

// Init function
app.init = function () {
  app.leafletMap();
  $('#geoImage').on('click', app.getCurrentLocation);
};

// Document ready
$(document).ready(function () {
  app.init();
});