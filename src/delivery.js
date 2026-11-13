export const DELIVERY_DESTINATION = {
  latitude: -23.561414,
  longitude: -46.656223,
};

export const DELIVERY_ROUTE = [
  { latitude: -23.55623, longitude: -46.66349 },
  { latitude: -23.55706, longitude: -46.66231 },
  { latitude: -23.55808, longitude: -46.66104 },
  { latitude: -23.55914, longitude: -46.65973 },
  { latitude: -23.56013, longitude: -46.65835 },
  { latitude: -23.56091, longitude: -46.65736 },
  { latitude: -23.561414, longitude: -46.656223 },
];

export const DELIVERY_SPEED_KMH = 22;
export const PROXIMITY_ALERT_METERS = 500;
export const DELIVERY_COMPLETE_METERS = 35;
export const SIMULATION_INTERVAL_MS = 5000;

export function calculateDistanceMeters(origin, destination) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function getDeliveryStatus(distanceMeters, isLastPoint) {
  if (isLastPoint || distanceMeters <= DELIVERY_COMPLETE_METERS) {
    return 'Entregue';
  }

  if (distanceMeters < PROXIMITY_ALERT_METERS) {
    return 'Próximo';
  }

  return 'Em trânsito';
}

export function getEstimatedMinutes(distanceMeters) {
  if (distanceMeters <= DELIVERY_COMPLETE_METERS) {
    return 0;
  }

  const metersPerMinute = (DELIVERY_SPEED_KMH * 1000) / 60;
  return Math.max(1, Math.ceil(distanceMeters / metersPerMinute));
}

export function getBearingDegrees(from, to) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const toDegrees = (radians) => (radians * 180) / Math.PI;
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const y = Math.sin(longitudeDelta) * Math.cos(toLatitude);
  const x =
    Math.cos(fromLatitude) * Math.sin(toLatitude) -
    Math.sin(fromLatitude) * Math.cos(toLatitude) * Math.cos(longitudeDelta);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function formatDistance(distanceMeters) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`;
}
