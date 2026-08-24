import { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { DashboardData } from '../types';
import axios from 'axios';

type SharedData = Partial<DashboardData> & { secondsAgo?: number; mode?: string };

let sharedData: SharedData = {};
let lastReceiveTime = Date.now();
let subscribers = 0;
let initialFetchStarted = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let tickerInterval: ReturnType<typeof setInterval> | null = null;
let wsUnsubscribe: (() => void) | null = null;
const listeners = new Set<(data: SharedData) => void>();

const publish = (patch: SharedData) => {
  sharedData = { ...sharedData, ...patch };
  listeners.forEach((listener) => listener(sharedData));
};

const fetchInitialData = async () => {
  try {
    const [resTel, resTwin, resRisk, resMl, resSim] = await Promise.allSettled([
      axios.get('/api/telemetry/current'),
      axios.get('/api/twin/state'),
      axios.get('/api/security/risk'),
      axios.get('/api/ml/status'),
      axios.get('/api/simulation/status')
    ]);

    const initial: SharedData = {};
    if (resTel.status === 'fulfilled' && resTel.value.data) {
      initial.telemetry = resTel.value.data;
      initial.mode = resTel.value.data.is_simulation ? 'SIMULATION' : 'LIVE';
    }
    if (resTwin.status === 'fulfilled' && resTwin.value.data) {
      initial.digital_twin = resTwin.value.data;
    }
    if (resRisk.status === 'fulfilled' && resRisk.value.data) {
      initial.risk = resRisk.value.data;
      initial.risk_score = resRisk.value.data;
    }
    if (resMl.status === 'fulfilled' && resMl.value.data) {
      initial.ml_result = resMl.value.data;
    }
    if (resSim.status === 'fulfilled' && resSim.value.data) {
      initial.simulation = resSim.value.data;
    }

    lastReceiveTime = Date.now();
    publish({ ...initial, secondsAgo: 0 });
  } catch (err) {
    console.error('Initial state fetch error', err);
  }
};

const startSharedStream = () => {
  if (!initialFetchStarted) {
    initialFetchStarted = true;
    fetchInitialData();
  }

  const token = localStorage.getItem('token') || 'analyst-token';
  wsService.connect(token);

  if (!wsUnsubscribe) {
    wsUnsubscribe = wsService.onMessage((msg: any) => {
      const payload = msg?.data || msg;
      if (!payload) return;

      lastReceiveTime = Date.now();
      publish({
        ...payload,
        telemetry: payload.telemetry || sharedData.telemetry,
        digital_twin: payload.digital_twin || sharedData.digital_twin,
        risk: payload.risk || payload.risk_score || sharedData.risk,
        risk_score: payload.risk || payload.risk_score || sharedData.risk_score,
        ml_result: payload.ml_result || sharedData.ml_result,
        mode: payload.mode?.toUpperCase() || (payload.telemetry?.is_simulation ? 'SIMULATION' : 'LIVE'),
        secondsAgo: 0
      });
    });
  }

  if (!pollInterval) {
    pollInterval = setInterval(async () => {
      try {
        const resTel = await axios.get('/api/telemetry/current');
        if (resTel.data) {
          lastReceiveTime = Date.now();
          publish({
            telemetry: resTel.data,
            mode: resTel.data.is_simulation ? 'SIMULATION' : 'LIVE',
            secondsAgo: 0
          });
        }
      } catch {
        // WebSocket reconnect remains the primary recovery path.
      }
    }, 5000);
  }

  if (!tickerInterval) {
    tickerInterval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - lastReceiveTime) / 1000));
      publish({ secondsAgo: elapsed });
    }, 1000);
  }
};

const stopSharedStreamIfUnused = () => {
  if (subscribers > 0) return;

  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  if (tickerInterval) {
    clearInterval(tickerInterval);
    tickerInterval = null;
  }
  if (wsUnsubscribe) {
    wsUnsubscribe();
    wsUnsubscribe = null;
  }
  wsService.disconnect();
  initialFetchStarted = false;
};

export function useWebSocket() {
  const [data, setData] = useState<SharedData>(sharedData);

  useEffect(() => {
    subscribers += 1;
    listeners.add(setData);
    setData(sharedData);
    startSharedStream();

    return () => {
      listeners.delete(setData);
      subscribers = Math.max(0, subscribers - 1);
      stopSharedStreamIfUnused();
    };
  }, []);

  return data as any;
}
