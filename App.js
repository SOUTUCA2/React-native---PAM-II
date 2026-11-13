import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Magnetometer } from 'expo-sensors';
import DeliveryMap from './src/DeliveryMap';
import { IS_EXPO_GO } from './src/environment';
import { updateDeliveryWidget } from './src/updateDeliveryWidget';
import {
  calculateDistanceMeters,
  DELIVERY_DESTINATION,
  DELIVERY_ROUTE,
  DELIVERY_SPEED_KMH,
  formatDistance,
  getBearingDegrees,
  getDeliveryStatus,
  getEstimatedMinutes,
  PROXIMITY_ALERT_METERS,
  SIMULATION_INTERVAL_MS,
} from './src/delivery';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const STATUS_COPY = {
  'Em trânsito': 'O entregador está a caminho do seu endereço.',
  Próximo: 'Seu pedido está chegando. Fique de olho!',
  Entregue: 'Seu pedido chegou ao destino.',
};

function formatMinutes(minutes) {
  if (minutes === 0) {
    return 'Chegou';
  }

  return `${minutes} min`;
}

function InfoCard({ icon, label, value }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function App() {
  const [routeIndex, setRouteIndex] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const proximityNotified = useRef(false);
  const deliveredNotified = useRef(false);
  const currentPosition = DELIVERY_ROUTE[routeIndex];
  const distanceMeters = useMemo(
    () => calculateDistanceMeters(currentPosition, DELIVERY_DESTINATION),
    [currentPosition]
  );
  const isLastPoint = routeIndex === DELIVERY_ROUTE.length - 1;
  const status = getDeliveryStatus(distanceMeters, isLastPoint);
  const estimatedMinutes = getEstimatedMinutes(distanceMeters);
  const nextPoint =
    DELIVERY_ROUTE[Math.min(routeIndex + 1, DELIVERY_ROUTE.length - 1)];
  const vehicleBearing = getBearingDegrees(currentPosition, nextPoint);

  useEffect(() => {
    let active = true;

    async function prepareNotifications() {
      if (Platform.OS === 'web') {
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('entregas', {
          name: 'Atualizações de entrega',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const currentPermission = await Notifications.getPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Notifications.requestPermissionsAsync();

      if (active) {
        setNotificationsEnabled(permission.granted);
      }
    }

    prepareNotifications().catch((error) => {
      setErrorMessage(`Não foi possível ativar as notificações: ${error.message}`);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRouteIndex((index) =>
        Math.min(index + 1, DELIVERY_ROUTE.length - 1)
      );
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let subscription;
    let active = true;

    async function startCompass() {
      if (Platform.OS === 'web') {
        return;
      }

      const available = await Magnetometer.isAvailableAsync();
      if (!active || !available) {
        return;
      }

      Magnetometer.setUpdateInterval(250);
      subscription = Magnetometer.addListener(({ x, y }) => {
        const heading = (Math.atan2(y, x) * 180) / Math.PI;
        setCompassHeading((heading + 360) % 360);
      });
    }

    startCompass().catch((error) => {
      setErrorMessage(`Não foi possível iniciar a bússola: ${error.message}`);
    });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }

    if (
      distanceMeters < PROXIMITY_ALERT_METERS &&
      !proximityNotified.current
    ) {
      proximityNotified.current = true;
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sua entrega está chegando',
          body: `O entregador está a ${formatDistance(distanceMeters)} do endereço.`,
          sound: false,
        },
        trigger: null,
      }).catch((error) => {
        setErrorMessage(`Não foi possível enviar o alerta: ${error.message}`);
      });
    }

    if (status === 'Entregue' && !deliveredNotified.current) {
      deliveredNotified.current = true;
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pedido entregue',
          body: 'Sua encomenda chegou ao destino.',
          sound: false,
        },
        trigger: null,
      }).catch((error) => {
        setErrorMessage(`Não foi possível enviar o alerta: ${error.message}`);
      });
    }
  }, [distanceMeters, notificationsEnabled, status]);

  useEffect(() => {
    if (Platform.OS !== 'android' || IS_EXPO_GO) {
      return;
    }

    const widgetState = {
      status,
      eta: estimatedMinutes,
      distance: formatDistance(distanceMeters),
    };

    updateDeliveryWidget(widgetState).catch((error) => {
      setErrorMessage(`Não foi possível atualizar o widget: ${error.message}`);
    });
  }, [distanceMeters, estimatedMinutes, status]);

  function resetSimulation() {
    proximityNotified.current = false;
    deliveredNotified.current = false;
    setRouteIndex(0);
    setErrorMessage('');
  }

  const statusColor =
    status === 'Entregue'
      ? '#22865B'
      : status === 'Próximo'
        ? '#B85F12'
        : '#356F5A';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ROTA EXPRESS  ·  PEDIDO #BR-2048</Text>
            <Text style={styles.title}>Sua entrega</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <View style={[styles.statusIcon, { backgroundColor: statusColor }]}>
              <Text style={styles.statusIconText}>
                {status === 'Entregue' ? '✓' : '↗'}
              </Text>
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusLabel}>STATUS DO PEDIDO</Text>
              <Text style={styles.statusTitle}>{status}</Text>
              <Text style={styles.statusDescription}>{STATUS_COPY[status]}</Text>
            </View>
            <View style={styles.etaBox}>
              <Text style={styles.etaValue}>
                {formatMinutes(estimatedMinutes)}
              </Text>
              <Text style={styles.etaLabel}>estimados</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((routeIndex + 1) / DELIVERY_ROUTE.length) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Pedido enviado</Text>
            <Text style={styles.progressLabel}>A caminho</Text>
            <Text style={styles.progressLabel}>Entregue</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Acompanhe no mapa</Text>
            <Text style={styles.sectionSubtitle}>
              Trajeto simulado em tempo real
            </Text>
          </View>
          <View style={styles.compassBadge}>
            <Text style={styles.compassIcon}>⌖</Text>
            <Text style={styles.compassValue}>
              {Math.round(compassHeading)}°
            </Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <DeliveryMap
            currentPosition={currentPosition}
            destination={DELIVERY_DESTINATION}
            route={DELIVERY_ROUTE}
            routeIndex={routeIndex}
            vehicleBearing={vehicleBearing}
            compassHeading={compassHeading}
          />
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={styles.legendDotOrange} />
              <Text style={styles.legendText}>Entregador</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDotGreen} />
              <Text style={styles.legendText}>Seu endereço</Text>
            </View>
          </View>
          <View style={styles.distancePill}>
            <Text style={styles.distancePillText}>
              {formatDistance(distanceMeters)} até o destino
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoCard icon="⌖" label="DISTÂNCIA" value={formatDistance(distanceMeters)} />
          <InfoCard
            icon="◷"
            label="PREVISÃO"
            value={formatMinutes(estimatedMinutes)}
          />
          <InfoCard icon="➤" label="DIREÇÃO" value={`${Math.round(vehicleBearing)}°`} />
        </View>

        {Platform.OS === 'web' || IS_EXPO_GO ? (
          <View style={styles.platformNote}>
            <Text style={styles.platformNoteText}>
              {Platform.OS === 'web'
                ? 'Prévia web: notificações, bússola e widget dependem do aplicativo nativo.'
                : 'No Expo Go, a simulação funciona; o widget só fica disponível no build Android próprio.'}
            </Text>
          </View>
        ) : null}

        {status === 'Próximo' && (
          <View style={styles.proximityNote}>
            <Text style={styles.proximityIcon}>!</Text>
            <Text style={styles.proximityText}>
              {notificationsEnabled
                ? `O entregador entrou no raio de alerta de ${PROXIMITY_ALERT_METERS} m. Notificação local enviada.`
                : `O entregador está a menos de ${PROXIMITY_ALERT_METERS} m. Ative as notificações para receber alertas.`}
            </Text>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Text style={styles.addressIconText}>⌂</Text>
            </View>
            <View style={styles.addressCopy}>
              <Text style={styles.addressLabel}>ENDEREÇO DE ENTREGA</Text>
              <Text style={styles.addressTitle}>Rua Augusta, 1200</Text>
              <Text style={styles.addressDetail}>Consolação · São Paulo, SP</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reiniciar simulação de entrega"
            onPress={resetSimulation}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.resetIcon}>↻</Text>
          </Pressable>
        </View>
        <Text style={styles.footerNote}>
          SIMULAÇÃO DIDÁTICA · ALERTA DE PROXIMIDADE EM {PROXIMITY_ALERT_METERS} M
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 28,
    gap: 18,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#78857D',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.15,
  },
  title: {
    color: '#14231F',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 5,
    letterSpacing: -0.7,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F3EB',
    borderRadius: 30,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34A46D',
  },
  liveText: {
    color: '#28764F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    shadowColor: '#24352C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  statusCopy: {
    flex: 1,
  },
  statusLabel: {
    color: '#89958E',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusTitle: {
    color: '#192820',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  statusDescription: {
    color: '#758078',
    fontSize: 11,
    marginTop: 3,
  },
  etaBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  etaValue: {
    color: '#F27637',
    fontSize: 22,
    fontWeight: '800',
  },
  etaLabel: {
    color: '#89958E',
    fontSize: 9,
    marginTop: 1,
  },
  progressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: '#EDF0EB',
    overflow: 'hidden',
    marginTop: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#F27637',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  progressLabel: {
    color: '#89958E',
    fontSize: 9,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -8,
  },
  sectionTitle: {
    color: '#1C2A23',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#89958E',
    fontSize: 11,
    marginTop: 3,
  },
  compassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compassIcon: {
    color: '#F27637',
    fontSize: 17,
  },
  compassValue: {
    color: '#536159',
    fontSize: 10,
    fontWeight: '700',
  },
  mapContainer: {
    height: 278,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E1E9E2',
  },
  mapLegend: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 11,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDotOrange: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F27637',
  },
  legendDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22865B',
  },
  legendText: {
    color: '#59665E',
    fontSize: 9,
    fontWeight: '600',
  },
  distancePill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: '#14231F',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  distancePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  infoIcon: {
    color: '#F27637',
    fontSize: 17,
    marginBottom: 8,
  },
  infoLabel: {
    color: '#89958E',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  infoValue: {
    color: '#203027',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  proximityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF2E8',
    borderRadius: 15,
    padding: 12,
  },
  proximityIcon: {
    color: '#B85F12',
    fontSize: 17,
    fontWeight: '800',
  },
  proximityText: {
    flex: 1,
    color: '#895324',
    fontSize: 11,
    lineHeight: 16,
  },
  platformNote: {
    backgroundColor: '#E8F0EC',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  platformNoteText: {
    color: '#536159',
    fontSize: 11,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FFF0EF',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#A23D37',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  addressCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#E6F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addressIconText: {
    color: '#22865B',
    fontSize: 19,
  },
  addressCopy: {
    flex: 1,
  },
  addressLabel: {
    color: '#89958E',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  addressTitle: {
    color: '#203027',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  addressDetail: {
    color: '#89958E',
    fontSize: 10,
    marginTop: 2,
  },
  resetButton: {
    width: 52,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetIcon: {
    color: '#356F5A',
    fontSize: 25,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.65,
  },
  footerNote: {
    color: '#9BA59F',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
    textAlign: 'center',
  },
});
