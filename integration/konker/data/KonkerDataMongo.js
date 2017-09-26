var config = require('./../../../config');
var devicesCredentials = require('./../../../lib/database').devicesCredentials;

function processResults(error, results, callback) {
  if (error || results.length === 0) {
    return handleError(error, callback);
  }

  logEvent(403, { devices: results });
  callback(null, { devices: results });
}

const getDeviceCredentialsByUuidPromise = (uuid) => {
  return new Promise((resolve, reject) => {
    if (!uuid) {
      return reject("uuid undefined")
    }

    var fetch = {};

    fetch["$or"] = [
      {
        uuid: uuid
      }
    ];

    devicesCredentials.find(fetch, {})
      .maxTimeMS(10000)
      .limit(1000)
      .sort({ _id: -1 }, function (err, devicedata) {
        if (err) {
          return reject(err)
        } else {
          return resolve(devicedata)
        }
      });
  });
}

const saveDeviceCredentials = (uuid, apiKey, password) => {
  let newDeviceCredentials = {
    uuid: uuid,
    apiKey: apiKey,
    password: password
  };

  devicesCredentials.insert(newDeviceCredentials, (function(res) { 
    console.log("Device credentials created: " + uuid)
  }));


}

// **************** EXPORTS ****************
module.exports = {
  getDeviceCredentialsByUuidPromise,
  saveDeviceCredentials
}