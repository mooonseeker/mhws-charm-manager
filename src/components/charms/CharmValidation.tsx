import { AlertTriangle, Info } from 'lucide-react';
import type { CharmValidationResult } from '@/types';

interface CharmValidationProps {
    validation: CharmValidationResult | null;
}

/**
 * 护石验证提示组件
 * 显示智能判定的警告信息
 */
export function CharmValidation({ validation }: CharmValidationProps) {
    if (!validation || validation.warnings.length === 0) {
        return null;
    }

    return (
        <div
            className={`rounded-lg border p-4 ${validation.isInferior
                ? 'border-destructive/20 bg-destructive/10'
                : 'border-warning/20 bg-warning/10'
                }`}
        >
            <div className="flex items-start gap-3">
                {validation.isInferior ? (
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                ) : (
                    <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                    <p
                        className={`font-medium mb-1 ${validation.isInferior ? 'text-destructive' : 'text-warning-foreground'
                            }`}
                    >
                        {validation.isInferior ? '⚠️ 不建议添加' : 'ℹ️ 提示'}
                    </p>
                    <ul className="text-sm space-y-1">
                        {validation.warnings.map((warning, index) => (
                            <li
                                key={index}
                                className={validation.isInferior ? 'text-destructive' : 'text-warning'}
                            >
                                • {warning}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}