import { useState } from 'react';

import { CharmManagement } from '@/components/charms';
import { DataManagement } from '@/components/data';
import { Footer, Header, Navigation } from '@/components/layout';
import { SkillManagement } from '@/components/skills';
import { AppProvider } from '@/contexts';

import type { NavigationTab } from '@/components/layout';

function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('charms');

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="h-2"></div>
        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="mx-auto w-[80%] px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 landscape:py-4 mobile-landscape:py-3 flex-1">
          {currentTab === 'skills' && <SkillManagement />}
          {currentTab === 'charms' && <CharmManagement />}
          {currentTab === 'data' && <DataManagement />}
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
