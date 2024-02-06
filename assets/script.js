var authenticateEl = document.getElementById("authenticate");
var loggedInEl = document.getElementById("loggedin");
var unfollowEl = document.getElementById("unfollow");

const JAMBASE_API_URL = "https://www.jambase.com/jb-api";
const JAMBASE_API_KEY = "c06e8359-9476-484d-8390-20a1f50ca68d";

// From Spotify Web API Documentation ----------------------------------------
// clientID is specific to the registered application with Spotify
const clientId = '2b183a70265148259c2caa4ab030b5ec';
// Before pushing to main branch change the URL to the final project deployed URL
const redirectUri = 'https://magicaryn.github.io/ConcertSampler/index.html';
//const redirectUri = 'http://127.0.0.1:5500/index.html';
// ---------------------------------------------------------------------------

var eventObj = {};
var jsonMetroObj = {};
var cachedMetroId = null;
var artistsArr = [];
var allTracksArr = [];

$(document).ready(function () {
    jsonMetroObj = getJambaseMetros();
    document.getElementById("calendar").style.display = "none";

    let todayDate = new Date();
    let todayDateString = todayDate.toISOString().split('T')[0];

    document.getElementById("startDate").value = todayDateString;
})

function setCheckboxById(checkId) {
    document.getElementById(checkId).checked = true;
}

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

    let URL = JAMBASE_API_URL + "/v1/events" + "?apikey=" + JAMBASE_API_KEY + "&geoMetroId=" + cachedMetroId + "&eventDateFrom=" + startDate + "&eventDateTo=" + endDate;

    let response = httpGet(URL);

    let jsonObj = JSON.parse(response);

    eventObj = jsonObj;

    let container = document.getElementById("results-container");

    container.textContent = "";

    artistsArr = [];

    if (jsonObj.events != null) {
        for (var i = 0; i < jsonObj.events.length; ++i) {
            let currentDate = new Date(jsonObj.events[i].startDate);

            container.innerHTML += "<li onclick=\"getJambasePerformers('" + jsonObj.events[i].identifier + "')\">" + jsonObj.events[i].name + " Date: " + currentDate.toLocaleDateString() + "</li>"
        }

        for (var i = 0; i < eventObj.events.length; ++i) {
            for (var j = 0; j < eventObj.events[i].performer.length; ++j) {
                artistsArr.push(eventObj.events[i].performer[j].name);
            }
        }
    }

    setCheckboxById("checkboxNoLabel2");
}

function processJambaseEventsResponse(response) {
    return JSON.parse(response);
}

function getJambasePerformers(eventId) {
    document.getElementById("calendar").style.display = "none";

    let container = document.getElementById("results-container");

    container.textContent = "";
    artistsArr = [];

    for (var i = 0; i < eventObj.events.length; ++i) {
        if (eventObj.events[i].identifier === eventId) {
            for (var j = 0; j < eventObj.events[i].performer.length; ++j) {
                artistsArr.push(eventObj.events[i].performer[j].name);
                container.innerHTML += "<li onclick=\"searchForSpotifyArtist('" + eventObj.events[i].performer[j].name + "', true)\">" + eventObj.events[i].performer[j].name + "</li>"
            }
        }
    }

    setCheckboxById("checkboxNoLabel3");
}

function onClickCreateAllTracksPlaylist() {
    createAllTracksPlaylist();
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

            container.innerHTML += "<li class=\"" + cssClass + "\" onclick=\"getJambaseEventsByMetroID('" + jsonMetroObj.metros[i].identifier + "')\">" + jsonMetroObj.metros[i].name + " ~ " + jsonMetroObj.metros[i].address.addressRegion + "</li>";
        }
    }    

    return resultsArr;
}


// Spotify API Functions // Spotify API Functions // Spotify API Functions // Spotify API Functions // Spotify API Functions // Spotify API Functions

function filterByDates(e) {
    getJambaseEventsByMetroID(null);
}

function createAllTracksPlaylist() {
    var i = 0;
    var lastArtist = "";
    for (i = 0; i < artistsArr.length; ++i) {
        if (i == artistsArr.length - 1 || i == 30) {
            searchForSpotifyArtist(artistsArr[i], true);
            break;
        } else {
            searchForSpotifyArtist(artistsArr[i], false);
        }
    }
}

async function searchForSpotifyArtist(artist, createPlaylist) {
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
    
    if (data.artists == null) {
        console.log("Artist can not be found")
    } else {
        var spotifyArtistId = (data.artists.items[0].id);

        getSpotifyArtistTopTracks(spotifyArtistId, artist, accessToken, createPlaylist);
    }

};


async function getSpotifyArtistTopTracks(artistID, artist, accessToken, createPlaylist) {
    let container = document.getElementById("results-container");

    container.textContent = "";

    const response = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/top-tracks?market=US', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    
    var trackIdsArray = [];

    for (var t = 0; data.tracks != null && t < 3; t++) {
        trackIdsArray[t] = data.tracks[t].id;
        allTracksArr.push(data.tracks[t].id);
    };

    if (createPlaylist) {
        getSpotifyUserID(allTracksArr, artist, accessToken);
    }
}

async function getSpotifyUserID(trackIdsArray, artist, accessToken) {

    let container = document.getElementById("results-container");

    const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();

    var userId = data.id;
    
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

    var playlistId = data.id; 

    addItemsToPlaylist(playlistId, userId, trackIdsArray, accessToken);

    setCheckboxById("checkboxNoLabel1");
}

async function addItemsToPlaylist(playlistId, userId, trackIdsArray, accessToken) {

    var trackIdsUris = [];

    for (var i = 0; i < trackIdsArray.length; i++) {
        trackIdsUris[i] = ("spotify:track:" + trackIdsArray[i]);
    };

    const response = await fetch('https://api.spotify.com/v1/playlists/' + playlistId + '/tracks', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        }, body:JSON.stringify({
            "uris": trackIdsUris
        })
    });

    const data = await response.json();

    let container = document.getElementById("results-container");
    container.innerHTML += ('<li>Good news!  Your playlist has been created.  It has been added to your Spotify library and can also be listened to here.</li>');

    iframePlaylist(playlistId, accessToken);
}


function iframePlaylist(playlistId, accessToken) {
 let container = document.getElementById("playlistiframe");
    container.innerHTML += ("<iframe " + 
    "style='border-radius:12px' " +
    "src=https://open.spotify.com/embed/playlist/" + playlistId + "?utm_source=generator&theme=0 " +
    "width='100%' " +
    "height='625' " +
    "frameBorder='0' " +
    "allowfullscreen='' " +
    "allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' " +
    "loading='lazy'><br />" +
    "<button id='unfollow'>Click here to remove playlist from your library</button>");

    // unfollowEl.addEventListener('click', unfollowPlaylist(playlistId, accessToken));
}

async function unfollowPlaylist(playlistId, accessToken) {

    const response = await fetch('https://api.spotify.com/v1/playlists/' + playlistId + '/followers', {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    
    unfollowEl.remove();
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


var logOut = function () {
localStorage.clear();
window.location.replace(redirectUri);
}


var checkUserAuthentification = function() {
    if ((localStorage.getItem("refresh_token")) !== "undefined" && localStorage.getItem("refresh_token") !== null) {
        getRefreshToken();
        loggedInEl.textContent = ('Welcome, ' + localStorage.getItem('display_name') + '!');
        authenticateEl.textContent = ('Click here to log out of Spotify');
        authenticateEl.addEventListener('click', logOut);
    } else if (window.location.search !== '' && !window.location.search.includes("error")) {
        getToken();
        loggedInEl.textContent = ('Welcome, ' + localStorage.getItem('display_name') + '!');
        authenticateEl.textContent = ('Click here to log out of Spotify');
        authenticateEl.addEventListener('click', logOut);   
    } else {
        authenticateEl.textContent = ('Click here to link your Spotify account');
        authenticateEl.addEventListener('click', spotifyAuthentification);
    };
};

checkUserAuthentification();
