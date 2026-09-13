import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext(null);

const STORAGE_KEY = 'musclehome_user_v1';

const defaultState = {
  onboarded: false,
  isPremium: false,
  profile: null,      // réponses du questionnaire
  analysis: null,      // résultat de l'analyse photo (morphotype, posture...)
  program: null,        // programme muscu généré
  nutrition: null,      // plan nutrition généré
  logs: [],             // historique des séances / poids
};

export function UserProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch (e) {
        console.warn('Erreur chargement profil', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const update = async (partial) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const addLog = async (entry) => {
    setState((prev) => {
      const next = { ...prev, logs: [...prev.logs, { ...entry, date: new Date().toISOString() }] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const reset = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  return (
    <UserContext.Provider value={{ ...state, loaded, update, addLog, reset }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
