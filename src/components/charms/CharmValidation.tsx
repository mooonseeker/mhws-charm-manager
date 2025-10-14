import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

import { useSkills } from '@/contexts';

import type { CharmValidationResult, Charm, Skill } from '@/types';
interface CharmValidationProps {
    validation: CharmValidationResult | null;
}

/**
 * 格式化护石的技能和孔位以供显示
 */
const formatCharmDetails = (charm: Charm, allSkills: Skill[]): string => {
    const skillsStr = charm.skills
        .map(s => {
            const skill = allSkills.find(sk => sk.id === s.skillId);
            return `${skill?.name || '未知技能'} Lv.${s.level}`;
        })
        .join(', ');

    const slotsStr = charm.slots.map(s => `[${s.level}]`).join('');
    return `(R${charm.rarity}) ${skillsStr} ${slotsStr}`;
}

/**
 * 护石验证提示组件（重构版）
 * 显示来自新验证逻辑的详细信息
 */
export function CharmValidation({ validation }: CharmValidationProps) {
    const { skills: allSkills } = useSkills();

    if (!validation) {
        return null;
    }

    const { status, warnings, betterCharm, outclassedCharms } = validation;

    const isRejected = status === 'REJECTED_AS_INFERIOR';
    const showWarning = !isRejected && (warnings?.length || outclassedCharms?.length);

    if (!isRejected && !showWarning) {
        return (
            <div className="rounded-lg border p-4 border-green-500/20 bg-green-500/10 text-green-700">
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">验证通过</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg border p-4 ${isRejected
                ? 'border-destructive/20 bg-destructive/10'
                : 'border-warning/20 bg-warning/10'
                }`}
        >
            <div className="flex items-start gap-3">
                {isRejected ? (
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                ) : (
                    <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                    <p
                        className={`font-medium mb-1 ${isRejected ? 'text-destructive' : 'text-warning-foreground'
                            }`}
                    >
                        {isRejected ? '⚠️ 不建议添加' : 'ℹ️ 提示'}
                    </p>
                    <ul className="text-sm space-y-1">
                        {isRejected && betterCharm && (
                            <li className="text-destructive">
                                • 完全不如现有护石: {formatCharmDetails(betterCharm, allSkills)}
                            </li>
                        )}
                        {warnings?.map((warning, index) => (
                            <li key={`warn-${index}`} className="text-warning-foreground">
                                • {warning}
                            </li>
                        ))}
                        {outclassedCharms?.map((charm, index) => (
                            <li key={`out-${index}`} className="text-warning-foreground">
                                • 可替代旧护石: {formatCharmDetails(charm, allSkills)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}