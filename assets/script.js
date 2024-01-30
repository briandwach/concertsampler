const JAMBASE_API_URL = "https://www.jambase.com/jb-api";
const JAMBASE_API_KEY = "c06e8359-9476-484d-8390-20a1f50ca68d";

var eventObj = {};

$(document).ready(function () {
})

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function getJambaseMetros() {
    let URL = JAMBASE_API_URL + "/v1/geographies/metros" + "?apikey=" + JAMBASE_API_KEY;

    let response = httpGet(URL);

    let jsonObj = JSON.parse(response);

    for (var i = 0; i < jsonObj.metros.length; ++i) {
        console.log("identifier: " + jsonObj.metros[i].identifier);
        console.log("name: " + jsonObj.metros[i].name);
    }

    console.log("response: " + response)

    return jsonObj;
}


function processJambaseMetrosResponse(response) {
    return JSON.parse(response);
}

function getJambaseEventsByMetroID(metroId) {
    let URL = JAMBASE_API_URL + "/v1/events" + "?apikey=" + JAMBASE_API_KEY + "&geoMetroId=" + metroId;

    let response = httpGet(URL);

    let jsonObj = JSON.parse(response);

    eventObj = jsonObj;

    let container = document.getElementById("results-container");

    container.textContent = "";

    for (var i = 0; i < jsonObj.events.length; ++i) {
        container.innerHTML += "<li onclick=\"getJambasePerformers('" + jsonObj.events[i].identifier + "')\">" + jsonObj.events[i].name + "</li>"
    }
}

function processJambaseEventsResponse(response) {
    return JSON.parse(response);
}

function getJambasePerformers(eventId) {
    let container = document.getElementById("results-container");

    container.textContent = "";

    for (var i = 0; i < eventObj.events.length; ++i) {
        if (eventObj.events[i].identifier === eventId) {
            for (var j = 0; j < eventObj.events[i].performer.length; ++j) {
                container.innerHTML += "<li onclick=\"searchForSpotifyArtist('" + eventObj.events[i].performer[j].name + "')\">" + eventObj.events[i].performer[j].name + "</li>"
            }
        }
    }
}

function getJambasePerformerName() {
    return // performer name
}

function bindMetrosData(data) {

}

function searchMetros() {
    let searchString = document.getElementById("textSearch").value;

    let jsonObj =  getJambaseMetros();

    var resultsArr = [];

    let container = document.getElementById("results-container");

    container.textContent = "";

    for (var i = 0; i < jsonObj.metros.length; ++i) {
        if (jsonObj.metros[i].name.includes(searchString)) {
            resultsArr.push({id: jsonObj.metros[i].identifier, name: jsonObj.metros[i].name});

            container.innerHTML += "<li onclick=\"getJambaseEventsByMetroID('" + jsonObj.metros[i].identifier + "')\">" + jsonObj.metros[i].name + "</li>"
        }
    }

    return resultsArr;
}


// Spotify API Functions

// Insert Spotify authentification logic here



//



function searchForSpotifyArtist (artist) {
    alert("Calling searchForSpotifyArtist for parameter artist as: " + artist);
    return; //Spotify Artist ID
}

function getSpotifyArtistTopTracks(artistID) {
    return; //JSON Object
}

function getSpotifyUserID() {
    return; //User ID
}

function createSpotifyPlaylist(userID) {
    return;
}

function addItemsToPlaylist(array) {
    return;
}

function optionToRemovePlaylist(item) {
    return;
}