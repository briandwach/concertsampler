var authenticateEl = document.getElementById("authenticate");
var refreshEl = document.getElementById("refresh");

const JAMBASE_API_URL = "https://www.jambase.com/jb-api";
const JAMBASE_API_KEY = "c06e8359-9476-484d-8390-20a1f50ca68d";

// From Spotify Web API Documentation ----------------------------------------
// clientID is specific to the registered application with Spotify
const clientId = '2b183a70265148259c2caa4ab030b5ec';
// Before pushing to main branch change the URL to the final project deployed URL
const redirectUri = 'https://magicaryn.github.io/ConcertSampler/index.html';
// ---------------------------------------------------------------------------

var eventObj = {};
var jsonMetroObj = {};
var cachedMetroId = null;

$(document).ready(function () {
    jsonMetroObj = getJambaseMetros();
    document.getElementById("calendar").style.display = "none";
})

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
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
    if (metroId != null) {
        cachedMetroId = metroId;
    }

    document.getElementById("search").style.display = "none";
    document.getElementById("calendar").style.display = "block";

    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    console.log("startDate: " + startDate);

    let URL = JAMBASE_API_URL + "/v1/events" + "?apikey=" + JAMBASE_API_KEY + "&geoMetroId=" + cachedMetroId + "&eventDateFrom=" + startDate + "&eventDateTo=" + endDate;

    console.log("URL: " + URL);

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
    document.getElementById("calendar").style.display = "none";

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

    var resultsArr = [];

    let container = document.getElementById("results-container");

    container.textContent = "";

    var index = 0;

    for (var i = 0; i < jsonMetroObj.metros.length; ++i) {
        if (jsonMetroObj.metros[i].name.toLowerCase().includes(searchString.toLowerCase())) {
            resultsArr.push({ id: jsonMetroObj.metros[i].identifier, name: jsonMetroObj.metros[i].name });

            var cssClass = "liGreen";
            if (index % 2 == 0) {
                cssClass = "liBlue"
            }
            ++index;

            container.innerHTML += "<li class=\"" + cssClass + "\" onclick=\"getJambaseEventsByMetroID('" + jsonMetroObj.metros[i].identifier + "')\">" + jsonMetroObj.metros[i].name + " ~ " + jsonMetroObj.metros[i].address.addressRegion + "</li>"
            console.log(searchString);
        }
    }

    

    return resultsArr;
}


// Spotify API Functions // Spotify API Functions // Spotify API Functions // Spotify API Functions // Spotify API Functions // Spotify API Functions

function filterByDates(e) {
    getJambaseEventsByMetroID(null);
}


async function searchForSpotifyArtist(artist) {
    //alert("Calling searchForSpotifyArtist for parameter artist as: " + artist);
    //return; //Spotify Artist ID
    let accessToken = localStorage.getItem('access_token');

    const response = await fetch('https://api.spotify.com/v1/search?q=' + artist + '&type=artist&market=US&limit=5', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    console.log('Spotify:');
    console.log(data);   
    console.log(data.artists.items[0].id);
    
    var spotifyArtistId = (data.artists.items[0].id);

    getSpotifyArtistTopTracks(spotifyArtistId, artist, accessToken);
};


async function getSpotifyArtistTopTracks(artistID, artist, accessToken) {
    let container = document.getElementById("results-container");

    container.textContent = "";

    //container.innerHTML += ('<li>' + artist + '</li>');
    //container.innerHTML += ('<li></li>');

    const response = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/top-tracks?market=US', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    console.log('Spotify:');
    console.log(data);
    
    var trackIdsArray = [];

    for (var t = 0; t < data.tracks.length; t++) {
        //container.innerHTML += ("<li>Track name: " + data.tracks[t].name + "</li><li>Track Spotify ID:" + data.tracks[t].id + "</li>");
        trackIdsArray[t] = data.tracks[t].id;
    };
    
    console.log(trackIdsArray);

    getSpotifyUserID(trackIdsArray, artist, accessToken);
}

async function getSpotifyUserID(trackIdsArray, artist, accessToken) {

    let container = document.getElementById("results-container");
    //container.innerHTML += ('<li></li>');


    const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    console.log('Spotify:');
    console.log(data);

    var userId = data.id;
    console.log(userId);
    container.innerHTML += ('<li>Hello ' + data.display_name + '!</li>');

    createSpotifyPlaylist(userId, trackIdsArray, artist, accessToken);
};

async function createSpotifyPlaylist(userId, trackIdsArray, artist, accessToken) {

    const response = await fetch('https://api.spotify.com/v1/users/' + userId + '/playlists', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        }, body:JSON.stringify({
            "name": artist + " from Concert Sampler",
            "description": "Created by Concert Sampler web application",
            "public": true
        })
    });

    const data = await response.json();
    console.log('Spotify:');
    console.log(data);

    var playlistId = data.id; 

    addItemsToPlaylist(playlistId, userId, trackIdsArray, accessToken);
}

async function addItemsToPlaylist(playlistId, userId, trackIdsArray, accessToken) {

    var trackIdsUris = [];

    for (var i = 0; i < trackIdsArray.length; i++) {
        trackIdsUris[i] = ("spotify:track:" + trackIdsArray[i]);
    };

    console.log("JSON Array for adding to playlist:");
    console.log(trackIdsUris);

    const response = await fetch('https://api.spotify.com/v1/playlists/' + playlistId + '/tracks', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        }, body:JSON.stringify({
            "uris": trackIdsUris
        })
    });

    const data = await response.json();
    console.log('Spotify:');
    console.log(data);

    let container = document.getElementById("results-container");
    //container.innerHTML += ('<li></li>');
    container.innerHTML += ('<li>Good news!  Your playlist has been created.  It has been added to your Spotify library and can also be listened to here.</li>');

    iframePlaylist(playlistId);
//Add event listener for deleting playlist.
}


function iframePlaylist(playlistId) {
 let container = document.getElementById("playlistiframe");
    container.innerHTML += ("<iframe " + 
    "style='border-radius:12px' " +
    "src=https://open.spotify.com/embed/playlist/" + playlistId + "?utm_source=generator&theme=0 " +
    "width='100%' " +
    "height='625' " +
    "frameBorder='0' " +
    "allowfullscreen='' " +
    "allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' " +
    "loading='lazy'>");
}

function optionToRemovePlaylist(item) {
    return;
}

// Spotify Authentification
//---------------------------------------------------------------------------------------------------------------

var spotifyAuthentification = async function () {

    localStorage.removeItem('code_verifier');

    // From Spotify Web API Documentation ----------------------------------------
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    };

    const codeVerifier = generateRandomString(64);
    // ---------------------------------------------------------------------------


    // From Spotify Web API Documentation ----------------------------------------
    const sha256 = async (plain) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    };
    // ---------------------------------------------------------------------------


    // From Spotify Web API Documentation ----------------------------------------
    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    };
    // ---------------------------------------------------------------------------  


    // From Spotify Web API Documentation ----------------------------------------
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    // ---------------------------------------------------------------------------



    const scope = 'playlist-modify-public';
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    // generated in the previous step
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        state: 'concertsampler',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
    // ---------------------------------------------------------------------------

};




// From Spotify Web API Documentation ----------------------------------------
const getToken = async token => {


    const url = "https://accounts.spotify.com/api/token";

    // From Spotify Web API Documentation ----------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    // ---------------------------------------------------------------------------


    // stored in the previous step
    let codeVerifier = localStorage.getItem('code_verifier');

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        }),
    };

    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    // ---------------------------------------------------------------------------


    // ------  Store display name
    const getDisplayName = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('access_token')
        }
    });

    const data = await getDisplayName.json();
    localStorage.setItem('display_name', data.display_name);
};


const getRefreshToken = async () => {

    // refresh token that has been previously stored
    const url = "https://accounts.spotify.com/api/token";
    const refreshToken = localStorage.getItem('refresh_token');

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId
        }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
};





var checkUserAuthentification = function() {
    var displayName = localStorage.getItem('display_name');
    var test = localStorage.getItem("refresh_token");

    if ((localStorage.getItem("refresh_token")) !== "undefined") {
        getRefreshToken();
        authenticateEl.textContent = ('Logged into Spotify as ' + displayName);
    } else if (window.location.search !== '') {
        getToken();
        authenticateEl.textContent = ('Logged into Spotify as ' + displayName);   
    } else {
        authenticateEl.textContent = ('Click here to link your Spotify account');
        authenticateEl.addEventListener('click', spotifyAuthentification);
    };
};

checkUserAuthentification();