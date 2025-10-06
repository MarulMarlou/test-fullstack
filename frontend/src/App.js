import React, { useCallback, useEffect, useRef } from 'react';
import './App.css';
import ListPanel from './components/ListPanel';
import SelectedPanel from './components/SelectedPanel';
import { apiClient } from './utils/apiClient';

function App() {
  const listRef = useRef();
  const selRef  = useRef();

  const saveState = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/state');
      localStorage.setItem('app-state', JSON.stringify(response.data));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, []);

  const refreshBoth = useCallback(async () => {
    const tasks = [];
    if (listRef.current?.refresh) {
      const promise = listRef.current.refresh();
      if (promise && typeof promise.then === 'function') tasks.push(promise);
    }
    if (selRef.current?.refresh) {
      const promise = selRef.current.refresh();
      if (promise && typeof promise.then === 'function') tasks.push(promise);
    }
    try {
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }
      await saveState();
    } catch (err) {
      console.error('Failed to refresh lists:', err);
    }
  }, [saveState]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = localStorage.getItem('app-state');
        if (savedState) {
          const state = JSON.parse(savedState);
          await apiClient.post('/api/state', state);
        }
        await refreshBoth();
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    };
    loadState();
  }, [refreshBoth]);

  return (
    <div className="app-container">
      <ListPanel ref={listRef} onMoved={refreshBoth} />
      <SelectedPanel ref={selRef} onMoved={refreshBoth} />
    </div>
  );
}

export default App;
