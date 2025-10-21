import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { runDataMigration } from '@/utils/migration';
import { getStorageVersion } from '@/utils/storage';

import App from './App.tsx';

// Run data migration check on startup
(() => {
  const LATEST_VERSION = '1.03.0';
  const storedVersion = getStorageVersion();

  if (storedVersion !== LATEST_VERSION) {
    console.log(
      `Version mismatch: stored is "${storedVersion}", expected "${LATEST_VERSION}". Starting migration.`
    );
    try {
      runDataMigration();
      console.log('Data migration completed successfully.');
    } catch (error) {
      console.error('Data migration failed:', error);
    }
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
