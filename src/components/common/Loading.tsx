import { Loader2 } from 'lucide-react';

interface LoadingProps {
    message?: string;
}

/**
 * 加载状态组件
 */
export function Loading({ message = '加载中...' }: LoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{message}</p>
        </div>
    );
}