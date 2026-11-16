const config = require('./app.json');

if (process.env.GOOGLE_MAPS_API_KEY) {
  config.expo.plugins.push([
    'react-native-maps',
    { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
  ]);
}

config.expo.extra = config.expo.extra || {};
config.expo.extra.eas = config.expo.extra.eas || {};
config.expo.extra.eas.projectId = '5145a9cc-83d2-493d-aaaa-e2344ad7223b';

module.exports = config;
