import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

function readOnlineState(state: NetInfoState): boolean {
  if (state.isConnected == null) {
    return true;
  }
  return state.isConnected && state.isInternetReachable !== false;
}

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(readOnlineState(state));
    });

    NetInfo.fetch().then(state => {
      setOnline(readOnlineState(state));
    });

    return unsubscribe;
  }, []);

  return { isOnline: online, isOffline: !online };
}
