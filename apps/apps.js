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
      const shiftCity = citiesArray.shift();
      const firstCity = (`${shiftCity},${abbreviation}`);
      citiesArray.forEach((city) => {
        pushLocEq.push(`location=${city},${abbreviation}`);
      });
      pushLocEq.unshift(firstCity);
      mapQString.push(pushLocEq.join(`&`));
      app.getLatLng(mapQString);
    })
    .fail(function () {
      swal({
        title: 'Air quality is so good here that there is no need to measure it'
      })
    });
}

app.getLatLng = (citiesString) => {
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

app.leafletMap = () => {
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
      style: function (feature, featureLayer) {
        return {
          color: '#257eca',
          weight: 0.5
        }
      }
    }).addTo(app.map);
  });
  // initial province labels
  L.marker([49.8951, -97.1384]).bindTooltip('Manitoba', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([51.6532, -86.3832]).bindTooltip('Ontario', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([64.2823, -135.0000]).bindTooltip('Yukon', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([64.8255, -124.8457]).bindTooltip('Northwest Territories', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([46.5107, -63.4168]).bindTooltip('Prince Edward Island', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([47.5655, -52.7104]).bindTooltip('Newfoundland and Labrador', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([51.8139, -73.2080]).bindTooltip('Quebec', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([53.9333, -116.5765]).bindTooltip('Alberta', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([52.9399, -106.4509]).bindTooltip('Saskatchewan', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([63.7616, -68.5014]).bindTooltip('Nunavut', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([44.6820, -63.7443]).bindTooltip('Nova Scotia', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([46.5653, -66.4619]).bindTooltip('New Brunswick', {permanent: true}).openTooltip().addTo(app.map);
  L.marker([53.7267, -127.6476]).bindTooltip('British Columbia', {permanent: true}).openTooltip().addTo(app.map);

}

// Getting browser geolocaion 
app.getCurrentLocation = function () {
  $('aside').hide();
  navigator.geolocation.getCurrentPosition(function (location) {
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
  $('#closeButton').on('click', () => {
    $('aside').hide();
  });
};

// Document ready
$(document).ready(function () {
  app.init();
});