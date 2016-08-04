'use strict';
var router = require('express').Router();

module.exports = router;
var https = require('https');

function parseName(name) {
    return name.replace(/\s/,'+');
}



function getLocationData(name) {
    return https.get('//maps.googleapis.com/maps/api/geocode/json?address=' + parseName(name))
    .then(function(result){
        return result.results[0];
    })
}

function findCenterPoint(locationObject) {
    let ne = locationObject.geometry.bounds.northeast;
    let sw = locationObject.geometry.bounds.southwest;
    let latDistance = (ne.lat - sw.lat);
    let lngDistance = (ne.lng - sw.lng);

    let centerLat = sw.lat + latDistance/2;
    let centerLng = sw.lng + lngDistance/2;

    return {lat: centerLat, lng: centerLng};
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

function haversine(point1, point2) {
    var lat2 = point2.lat;
    var lon2 = point2.lng;
    var lat1 = point1.lat;
    var lon1 = point1.lng;

    var R = 6371; // km
    //has a problem with the .toRad() method below.
    var x1 = lat2-lat1;
    var dLat = x1.toRad();
    var x2 = lon2-lon1;
    var dLon = x2.toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}

function findRadius(locationObject) {
    let ne = locationObject.geometry.bounds.northeast;
    let sw = locationObject.geometry.bounds.southwest;
    let nw = {lat: ne.lat, lng: sw.lng};
    let se = {lat: sw.lat, lng: ne.lng};

    let width1 = haversine(ne, nw);
    let width2 = haversine(se, sw);
    console.log(width2 - width1);

    let height = haversine(nw, sw);

    let area = height * (width1 + width2) / 2;
    let radius = Math.sqrt(area / Math.PI);

    return radius;
}

function geocodeParam(locationObject) {
    let centerPoint = findCenterPoint(locationObject);
    let radius = findRadius(locationObject);

    return centerPoint.lat + ',' + centerPoint.lng + ',' + radius + 'km';

}

router.get('/', function(req, res, next){

    getLocationData(req.body.queryString)
    .then(function(locationObject){
        //Twitter Authentication
        let accessToken = req.session.oauthAccessToken;
        let secret = req.session.oauthAccessTokenSecret;
        let geocode = geocodeParam(locationObject);

        return flutter.API.fetch('search/tweets.json', {q: '', geocode: geocode}, accessToken, secret, function(err, results){
            return results;
        })
    })
    .then(function(tweetsObject){
        console.log(tweetsObject);
    })

});
