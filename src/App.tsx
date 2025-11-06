import { useState } from 'react';

import { CharmManagement } from '@/components/charms';
import { DatabaseManager } from '@/components/database';
import { Footer, Header, Navigation } from '@/components/layout';
import { SetBuilder } from '@/components/set-builder';
import { Settings } from '@/components/settings';
import { AppProvider } from '@/contexts';

import type { NavigationTab } from '@/components/layout';

function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('database');

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="h-2"></div>
        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="mx-auto w-[80%] px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 landscape:py-4 mobile-landscape:py-3 flex-1">
          {currentTab === 'database' && <DatabaseManager />}
          {currentTab === 'charms' && <CharmManagement />}
          {currentTab === 'set-builder' && <SetBuilder />}
          {currentTab === 'settings' && <Settings />}
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
