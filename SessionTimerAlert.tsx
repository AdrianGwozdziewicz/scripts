import React, { useEffect, useState, useRef } from 'react';

type Props = {
  ttl: number; // TTL w sekundach z nagłówka X-Session-TTL
  onExtendSession: () => void; // Funkcja wywoływana po kliknięciu "Przedłuż"
};

export const SessionTimerAlert: React.FC<Props> = ({ ttl, onExtendSession }) => {
  const [timeLeft, setTimeLeft] = useState(ttl);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Resetuj licznik przy każdym ttl
  useEffect(() => {
    setTimeLeft(ttl);
  }, [ttl]);

  // Odliczanie
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ttl]);

  if (timeLeft > 60) return null; // Pokazuj alert tylko, gdy zostaje mniej niż minuta

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: '#ffcc00',
      color: '#000',
      padding: '10px',
      textAlign: 'center',
      zIndex: 1000
    }}>
      <span>Sesja wygaśnie za {formatTime(timeLeft)}. </span>
      <button
        onClick={onExtendSession}
        style={{
          marginLeft: '10px',
          padding: '6px 12px',
          border: 'none',
          backgroundColor: '#000',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Przedłuż sesję
      </button>
    </div>
  );
};
