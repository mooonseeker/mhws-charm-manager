import { Shield } from 'lucide-react';

/**
 * 应用头部组件
 * 显示应用标题和Logo
 */
export function Header() {
    return (
        <header className="border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 landscape:py-2 mobile-landscape:py-1.5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 mobile-landscape:h-5 mobile-landscape:w-5" />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold mobile-landscape:text-lg">MHWS 护石管理器</h1>
                        <p className="text-xs sm:text-sm text-slate-300 mobile-landscape:hidden">Monster Hunter Wilds - Charm Manager</p>
                    </div>
                </div>
            </div>
        </header>
    );
}