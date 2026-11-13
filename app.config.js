const config = require('./app.json');

if (process.env.GOOGLE_MAPS_API_KEY) {
  config.expo.plugins.push([
    'react-native-maps',
    { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
  ]);
}

module.exports = config;
