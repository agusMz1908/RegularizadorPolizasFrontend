import React from 'react';
import { FORM_TABS, usePolicyFormContext } from '../PolicyFormProvider';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export function TabNavigation() {
  const { activeTab, setActiveTab, progress } = usePolicyFormContext();

  const renderTabIcon = (tab: typeof FORM_TABS[0]) => {
    const Icon = LucideIcons[tab.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
    const tabProgress = progress.byTab[tab.id];
    const hasErrors = tabProgress?.errors > 0;
    const isComplete = tabProgress?.completion === 100;

    if (hasErrors) {
      return <LucideIcons.AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (isComplete) {
      return <LucideIcons.CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const renderTabProgress = (tabId: typeof FORM_TABS[0]['id']) => {
    const tabProgress = progress.byTab[tabId];
    if (!tabProgress) return null;

    const { completion, errors: errorCount } = tabProgress;
    
    return (
      <div className="flex items-center gap-1 text-xs">
        {errorCount > 0 ? (
          <span className="text-red-600">{errorCount} errores</span>
        ) : completion === 100 ? (
          <span className="text-green-600">Completo</span>
        ) : (
          <span className="text-gray-500">{completion}%</span>
        )}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {FORM_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabProgress = progress.byTab[tab.id];
          const hasErrors = tabProgress?.errors > 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 px-4 text-center border-b-2 font-medium text-sm",
                "transition-colors flex flex-col sm:flex-row items-center justify-center gap-2",
                isActive 
                  ? "border-blue-500 text-blue-600" 
                  : hasErrors
                    ? "border-transparent text-red-500 hover:text-red-700 hover:border-red-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                {renderTabIcon(tab)}
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
              </div>
              {renderTabProgress(tab.id)}
            </button>
          );
        })}
      </nav>
    </div>
  );
}