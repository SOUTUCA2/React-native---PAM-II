import Constants, { ExecutionEnvironment } from 'expo-constants';

export const IS_EXPO_GO =
  Constants.appOwnership === 'expo' ||
  (Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    Constants.expoGoConfig != null);
