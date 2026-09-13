import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeStreak } from '../utils/streak';
import { scheduleWeeklyReminders, cancelAllReminders } from '../utils/notifications';

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
  weeklyGoal: 4,         // objectif de séances par semaine (streak hebdo, pas 7/7)
};

export function UserProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
      } catch (e) {
        console.warn('Erreur chargement profil', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Reprogramme les rappels au lancement de l'app (l'utilisateur peut rouvrir l'app
  // plusieurs jours après sa dernière séance, sans qu'addLog n'ait été rappelé entre-temps).
  useEffect(() => {
    if (loaded && state.onboarded) {
      const streakInfo = computeStreak(state.logs, state.weeklyGoal);
      scheduleWeeklyReminders(streakInfo).catch(() => {});
    }
  }, [loaded, state.onboarded]);

  const update = async (partial) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const addLog = async (entry) => {
    let nextState;
    setState((prev) => {
      nextState = { ...prev, logs: [...prev.logs, { ...entry, date: new Date().toISOString() }] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)).catch(() => {});
      return nextState;
    });
    // Reprogramme les rappels sur le nouvel état de streak (hors du setState pour éviter
    // un appel async dans l'updater fonctionnel).
    setTimeout(() => {
      if (nextState) {
        const streakInfo = computeStreak(nextState.logs, nextState.weeklyGoal);
        scheduleWeeklyReminders(streakInfo).catch(() => {});
      }
    }, 0);
  };

  const reset = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await cancelAllReminders().catch(() => {});
    setState(defaultState);
  };

  return (
    <UserContext.Provider value={{ ...state, loaded, update, addLog, reset }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
