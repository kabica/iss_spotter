/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (error, response, body) => {
    //ERROR Checking
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${response}`;
      callback(Error(msg), null);
      return;
    }

    //PARSE Body & Continue
    const ipAPI = JSON.parse(body);
    console.log('ipAPI: ', ipAPI);
    callback(error, ipAPI.ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/json/${ip}/full`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${response}`;
      callback(Error(msg), null);
      return;
    }
    //geoAPI = JSON.parse(body);
    //console.log(`geoAPI:  ${geoAPI.data.country_name}   --   LAT: ${geoAPI.data.latitude}   +   LNG: ${geoAPI.data.longitude}`);
    const {
      latitude,
      longitude
    } = JSON.parse(body).data;
    callback(null, {
      latitude,
      longitude
    });

  });

};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${response}`;
      callback(Error(msg), null);
      return;
    }
    const issAPI = JSON.parse(body).response;
    callback(null, issAPI);
  });
};


const nextISSTimesForMyLocation = function(callback) {
  // Get IP
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, geo) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(geo, (error, next) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, next);
      });
    });
  });
};




module.exports = { nextISSTimesForMyLocation };

