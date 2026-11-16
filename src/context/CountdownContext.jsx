import { createContext, useContext, useState, useEffect } from 'react';

const SALE_KEY = 'gripglow_sale_end';
const DIGIT_KEYS = ['h0', 'h1', 'm0', 'm1', 's0', 's1'];

function getOrInitDeadline() {
  // Default to 15 hours, 32 minutes, 22 seconds from now (matching screenshot reference)
  const DEFAULT_OFFSET_MS = (15 * 3600 + 32 * 60 + 22) * 1000;

  let saved = localStorage.getItem(SALE_KEY) || sessionStorage.getItem(SALE_KEY) || localStorage.getItem('voltalit_sale_end');
  let end = Number(saved);

  if (!end || isNaN(end) || end < Date.now()) {
    end = Date.now() + DEFAULT_OFFSET_MS;
    try {
      localStorage.setItem(SALE_KEY, String(end));
    } catch {
      // ignore storage quota/security errors
    }
  }
  return end;
}

function pad(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function calcRemaining(endTime) {
  const rem = Math.max(0, endTime - Date.now());
  const tot = Math.floor(rem / 1000);
  return {
    h: pad(Math.floor(tot / 3600)),
    m: pad(Math.floor((tot % 3600) / 60)),
    s: pad(tot % 60),
    totalSecs: tot,
    isExpired: tot <= 0,
  };
}

function buildInitialState(endTime) {
  const time = calcRemaining(endTime);
  const str = `${time.h.slice(-2)}${time.m}${time.s}`;
  const digits = {};
  DIGIT_KEYS.forEach((k, idx) => {
    digits[k] = { curr: str[idx] || '0', prev: str[idx] || '0', gen: 0 };
  });
  return { time, digits };
}

const CountdownContext = createContext(null);

export function CountdownProvider({ children }) {
  const [endTime] = useState(() => getOrInitDeadline());
  const [state, setState] = useState(() => buildInitialState(endTime));

  useEffect(() => {
    const tick = () => {
      setState((prevState) => {
        const nextTime = calcRemaining(endTime);
        if (nextTime.totalSecs === prevState.time.totalSecs) {
          return prevState;
        }
        const str = `${nextTime.h.slice(-2)}${nextTime.m}${nextTime.s}`;
        const nextDigits = {};
        DIGIT_KEYS.forEach((k, idx) => {
          const ch = str[idx] || '0';
          const old = prevState.digits[k];
          if (old.curr !== ch) {
            nextDigits[k] = { curr: ch, prev: old.curr, gen: old.gen + 1 };
          } else {
            nextDigits[k] = old;
          }
        });
        return { time: nextTime, digits: nextDigits };
      });
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <CountdownContext.Provider value={{ time: state.time, digits: state.digits, endTime }}>
      {children}
    </CountdownContext.Provider>
  );
}

export function useCountdown() {
  const ctx = useContext(CountdownContext);
  if (!ctx) {
    throw new Error('useCountdown must be used within a CountdownProvider');
  }
  return ctx;
}
