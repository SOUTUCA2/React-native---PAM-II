import React from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

function MapPin({ children, color }) {
  return (
    <View style={[styles.mapPin, { backgroundColor: color }]}>
      <Text style={styles.mapPinText}>{children}</Text>
    </View>
  );
}

export default function DeliveryMap({
  currentPosition,
  destination,
  route,
  routeIndex,
  vehicleBearing,
  compassHeading,
}) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: -23.559,
        longitude: -46.660,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      mapType="standard"
      showsCompass={false}
      showsUserLocation={false}
      toolbarEnabled={false}
    >
      <Polyline
        coordinates={route.slice(0, routeIndex + 1)}
        strokeColor="#F27637"
        strokeWidth={5}
        lineCap="round"
        lineJoin="round"
      />
      <Polyline
        coordinates={route.slice(routeIndex)}
        strokeColor="#C8D4CD"
        strokeWidth={4}
        lineDashPattern={[7, 7]}
      />
      <Marker coordinate={currentPosition} anchor={{ x: 0.5, y: 0.5 }}>
        <View
          style={[
            styles.vehicleMarker,
            {
              transform: [
                { rotate: `${vehicleBearing - compassHeading}deg` },
              ],
            },
          ]}
        >
          <Text style={styles.vehicleMarkerText}>➤</Text>
        </View>
      </Marker>
      <Marker coordinate={destination}>
        <MapPin color="#22865B">⌂</MapPin>
      </Marker>
    </MapView>
  );
}

const styles = {
  map: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  mapPinText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  vehicleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F27637',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  vehicleMarkerText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
};
