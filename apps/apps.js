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
    }).then(function(response) {
        console.log('Yay, I got a response', response);
    })
    .fail(function() {
        alert('Sorry, cities cannot be found');
    });
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
    }).then(function(response) {
        console.log('Yay, I got a response', response.data.current.pollution.aqius);
    })
    .fail(function() {
        alert('Sorry, your city cannot be found');
    });
};

let selectedProvince;
app.grabInput = () => {
    selectedProvince = $('.province').children("option:selected").val();
    alert("You have selected the province - " + selectedProvince);
    console.log(selectedProvince);
    app.getCitiesArray(selectedProvince);
    app.getCityData('Toronto', selectedProvince);

};


//Creating an init function
app.init = function() {
    $(".province").change(app.grabInput);
};

//Creating document ready
$(document).ready(function() {
    app.init();
});
