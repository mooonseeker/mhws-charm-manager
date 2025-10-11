import { useState } from 'react';
import { AppProvider } from '@/contexts';
import { Header, Navigation, Footer, type NavigationTab } from '@/components/layout';
import { SkillManagement } from '@/components/skills';
import { CharmManagement } from '@/components/charms';
import { DataManagement } from '@/components/data';

function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('charms');

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 landscape:py-3 mobile-landscape:py-2 flex-1">
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
