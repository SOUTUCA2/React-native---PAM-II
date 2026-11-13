import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function DeliveryWidget({ status, eta, distance }) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#14231F',
        borderRadius: 20,
        padding: 16,
        justifyContent: 'center',
      }}
    >
      <TextWidget
        text="ROTA EXPRESS  ·  PEDIDO #BR-2048"
        style={{ color: '#A8B9B0', fontSize: 11, fontWeight: 'bold' }}
      />
      <TextWidget
        text={status}
        style={{
          color: status === 'Entregue' ? '#78D9A3' : '#FFFFFF',
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: 8,
        }}
      />
      <TextWidget
        text={status === 'Entregue' ? 'Pedido finalizado' : `${eta} min  ·  ${distance}`}
        style={{ color: '#D5E0DA', fontSize: 14, marginTop: 4 }}
      />
    </FlexWidget>
  );
}
