import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryWidget } from './DeliveryWidget';

const WIDGET_NAME = 'DeliveryStatusWidget';
const STORAGE_KEY = '@rota-express/widget-state';
const INITIAL_WIDGET_STATE = {
  status: 'Em trânsito',
  eta: 8,
  distance: '2,4 km',
};

export async function widgetTaskHandler({ widgetInfo, renderWidget }) {
  if (widgetInfo.widgetName !== WIDGET_NAME) {
    return;
  }

  const savedState = await AsyncStorage.getItem(STORAGE_KEY);
  const widgetState = savedState
    ? JSON.parse(savedState)
    : INITIAL_WIDGET_STATE;

  renderWidget(<DeliveryWidget {...widgetState} />);
}
