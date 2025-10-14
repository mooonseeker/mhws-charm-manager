import { Database, List, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type NavigationTab = 'skills' | 'charms' | 'data';

interface NavigationProps {
    currentTab: NavigationTab;
    onTabChange: (tab: NavigationTab) => void;
}

/**
 * 导航组件
 * 使用Tab方式切换不同功能模块
 */
export function Navigation({ currentTab, onTabChange }: NavigationProps) {
    const tabs = [
        { id: 'skills' as const, label: '技能管理', icon: Sparkles },
        { id: 'charms' as const, label: '护石管理', icon: List },
        { id: 'data' as const, label: '数据管理', icon: Database },
    ];

    return (
        <nav className="bg-card">
            <div className="mx-auto w-[80%] px-4 sm:px-6 md:px-8 lg:px-10">
                <div className="flex gap-0.5 sm:gap-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <Button
                            key={id}
                            onClick={() => onTabChange(id)}
                            className={`
                flex items-center justify-center
                min-w-[120px] sm:min-w-[140px] md:min-w-[160px]
                gap-1.5 sm:gap-2
                px-6 sm:px-8 md:px-12
                py-2 sm:py-2.5 md:py-3 landscape:py-2 mobile-landscape:py-1.5
                border-2 transition-colors rounded-t-md rounded-b-none mb-[-1px]
                ${currentTab === id
                                    ? 'bg-background text-foreground  border-foreground border-b-background'
                                    : 'border-transparent'
                                }
              `}
                        >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 mobile-landscape:h-4 mobile-landscape:w-4" />
                            <span className="hidden sm:inline text-sm md:text-base mobile-landscape:text-sm">
                                {label}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>
        </nav>
    );
}