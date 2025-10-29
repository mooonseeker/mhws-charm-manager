import { DATABASE_VERSION } from '@/types/constants';

/**
 * 应用底部组件
 */
export function Footer() {
    const appVersion = __APP_VERSION__;

    return (
        <footer className="border-t bg-muted py-4 mt-auto">
            <div className="mx-auto w-[80%] px-4 sm:px-6 md:px-8 lg:px-10 text-center text-sm text-muted-foreground py-4 sm:py-5">
                <p>MHWS Charm Manager by <a href="https://github.com/mooonseeker">Moonseeker</a> © 2025</p>
                <p className="mt-1 text-xs">APP v{appVersion} | DB v{DATABASE_VERSION}</p>
            </div>
        </footer>
    );
}