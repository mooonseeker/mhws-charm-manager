import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/common';

/**
 * 应用头部组件
 * 显示应用标题、Logo和主题切换按钮
 */
export function Header() {
    return (
        <header className="border-b bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
            <div className="mx-auto w-[80%] px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 landscape:py-3 mobile-landscape:py-2">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Shield className="h-6 w-6 sm:h-8 sm:w-8 mobile-landscape:h-5 mobile-landscape:w-5" />
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold mobile-landscape:text-lg">MHWS 护石管理器</h1>
                            <p className="text-xs sm:text-sm text-primary-foreground/80 mobile-landscape:hidden">Monster Hunter Wilds - Charm Manager</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}