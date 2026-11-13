const WIDGET_NAME = 'DeliveryStatusWidget';
const STORAGE_KEY = '@rota-express/widget-state';

export async function updateDeliveryWidget(widgetState) {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const { requestWidgetUpdate } = require('react-native-android-widget');
  const { DeliveryWidget } = require('./DeliveryWidget');

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(widgetState));
  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => <DeliveryWidget {...widgetState} />,
  });
}
