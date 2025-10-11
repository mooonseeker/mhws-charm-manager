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
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
        >
            <div className="flex items-start gap-3">
                {validation.isInferior ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                    <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                    <p
                        className={`font-medium mb-1 ${validation.isInferior ? 'text-red-800' : 'text-yellow-800'
                            }`}
                    >
                        {validation.isInferior ? '⚠️ 不建议添加' : 'ℹ️ 提示'}
                    </p>
                    <ul className="text-sm space-y-1">
                        {validation.warnings.map((warning, index) => (
                            <li
                                key={index}
                                className={validation.isInferior ? 'text-red-700' : 'text-yellow-700'}
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