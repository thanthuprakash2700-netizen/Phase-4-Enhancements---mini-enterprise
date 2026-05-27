import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    
    const connect = () => {
      if (!token || !user) return;

      const wsUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('http', 'ws') + `/ws/?token=${token}`
        : `ws://localhost:8000/ws/?token=${token}`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts = 0; // Reset on successful connection
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        // Implement exponential backoff reconnect logic
        if (reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(10000, 1000 * Math.pow(2, reconnectAttempts));
          console.log(`Reconnecting in ${timeout}ms...`);
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, timeout);
        } else {
          console.error("Max WebSocket reconnect attempts reached.");
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) {
        // Prevent onclose from triggering a reconnect when unmounting
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [token, user]);

  return (
    <WebSocketContext.Provider value={{ lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
