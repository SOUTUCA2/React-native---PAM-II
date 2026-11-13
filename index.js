import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';
import { IS_EXPO_GO } from './src/environment';

if (Platform.OS === 'android' && !IS_EXPO_GO) {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widgetTaskHandler');
  registerWidgetTaskHandler(widgetTaskHandler);
}

registerRootComponent(App);
