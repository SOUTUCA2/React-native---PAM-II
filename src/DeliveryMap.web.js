import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Path,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

const MAP_BOUNDS = {
  north: -23.551,
  south: -23.567,
  east: -46.649,
  west: -46.669,
};

function getPoint(coordinate) {
  return {
    x:
      18 +
      ((coordinate.longitude - MAP_BOUNDS.west) /
        (MAP_BOUNDS.east - MAP_BOUNDS.west)) *
        324,
    y:
      16 +
      ((MAP_BOUNDS.north - coordinate.latitude) /
        (MAP_BOUNDS.north - MAP_BOUNDS.south)) *
        246,
  };
}

export default function DeliveryMap({
  currentPosition,
  destination,
  route,
  routeIndex,
  vehicleBearing,
  compassHeading,
}) {
  const completedPoints = route
    .slice(0, routeIndex + 1)
    .map(getPoint)
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
  const remainingPoints = route
    .slice(routeIndex)
    .map(getPoint)
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
  const vehicle = getPoint(currentPosition);
  const dropoff = getPoint(destination);

  return (
    <View style={styles.container}>
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        viewBox="0 0 360 278"
        preserveAspectRatio="none"
      >
        <Rect x="0" y="0" width="360" height="278" fill="#E8EDE5" />
        <Rect
          x="257"
          y="16"
          width="91"
          height="56"
          rx="12"
          fill="#D3E5CF"
        />
        <Rect x="25" y="19" width="54" height="31" rx="5" fill="#DDE4DA" />
        <Rect x="104" y="19" width="55" height="31" rx="5" fill="#DDE4DA" />
        <Rect x="183" y="19" width="54" height="31" rx="5" fill="#DDE4DA" />
        <Rect x="286" y="95" width="48" height="40" rx="5" fill="#DDE4DA" />
        <Rect x="22" y="96" width="56" height="41" rx="5" fill="#DDE4DA" />
        <Rect x="102" y="96" width="58" height="41" rx="5" fill="#DDE4DA" />
        <Rect x="185" y="96" width="57" height="41" rx="5" fill="#DDE4DA" />
        <Rect x="32" y="201" width="49" height="44" rx="5" fill="#DDE4DA" />
        <Rect x="106" y="201" width="58" height="44" rx="5" fill="#DDE4DA" />
        <Rect x="188" y="201" width="53" height="44" rx="5" fill="#DDE4DA" />
        <Rect x="267" y="201" width="69" height="44" rx="5" fill="#DDE4DA" />
        <Path
          d="M-15 80 L375 80 M-15 169 L375 169 M87 -15 L87 293 M170 -15 L170 293 M252 -15 L252 293"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="16"
        />
        <Path
          d="M-15 80 L375 80 M-15 169 L375 169 M87 -15 L87 293 M170 -15 L170 293 M252 -15 L252 293"
          fill="none"
          stroke="#D3D9D0"
          strokeWidth="1.5"
        />
        <SvgText
          x="109"
          y="73"
          fill="#77867B"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
        >
          R. AUGUSTA
        </SvgText>
        <SvgText
          x="181"
          y="163"
          fill="#77867B"
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
        >
          R. PEIXOTO GOMIDE
        </SvgText>
        <SvgText
          x="302"
          y="47"
          fill="#628264"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
        >
          PRAÇA
        </SvgText>
        {remainingPoints ? (
          <Polyline
            points={remainingPoints}
            fill="none"
            stroke="#C8D4CD"
            strokeWidth={4}
            strokeDasharray="7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {completedPoints ? (
          <Polyline
            points={completedPoints}
            fill="none"
            stroke="#F27637"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <Circle
          cx={dropoff.x}
          cy={dropoff.y}
          r={16}
          fill="#22865B"
          stroke="#FFFFFF"
          strokeWidth={3}
        />
        <SvgText
          x={dropoff.x}
          y={dropoff.y + 6}
          fill="#FFFFFF"
          fontSize={18}
          fontWeight="bold"
          textAnchor="middle"
        >
          ⌂
        </SvgText>
        <Circle
          cx={vehicle.x}
          cy={vehicle.y}
          r={19}
          fill="#F27637"
          stroke="#FFFFFF"
          strokeWidth={3}
        />
        <Path
          d="M -6 -8 L 10 0 L -6 8 L -2 0 Z"
          fill="#FFFFFF"
          transform={`translate(${vehicle.x} ${vehicle.y}) rotate(${vehicleBearing - compassHeading})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#E1E9E2',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 0,
  },
});
