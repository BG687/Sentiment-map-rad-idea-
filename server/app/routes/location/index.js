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

function findRadius(locationObject) {
    let ne = locationObject.geometry.bounds.northeast;
    let sw = locationObject.geometry.bounds.southwest;
    let latDistance = (ne.lat - sw.lat);
    let lngDistance = (ne.lng - sw.lng);

    let area = latDistance * lngDistance;
    let radius = Math.sqrt(area/Math.PI);

    return radius;
}

router.get('/location', function(req, res, next){
    getLocationData(req.body.queryString)
    .then(function(locationObject){
        let centerPoint = findCenterPoint(locationObject);
        let radius = findRadius(locationObject);
        return flutter.API.fetch('search/tweets.json', {q: 'bacon'}, accessToken, secret, function(err, results){
            return results;
        })
    })
    .then(function(tweetsObject){
        console.log(tweetsObject);
    })

});
