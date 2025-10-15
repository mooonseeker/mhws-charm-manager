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
    const hasWarnings = !!warnings?.length;
    const hasOutclassed = !!outclassedCharms?.length;

    // 根据不同的验证状态生成描述信息
    const getStatusMessage = (): string => {
        switch (status) {
            case 'ACCEPTED_AS_FIRST':
                return '✨ 这是第一个护石';
            case 'ACCEPTED_BY_MAX_VALUE':
                return '🌟 核心技能价值达到新高！';
            case 'ACCEPTED_BY_MAX_SLOTS':
                return '🌟 等效孔位数量达到新高！';
            case 'ACCEPTED_AS_UNIQUE_SKILL':
                return '✨ 拥有独特的技能组合';
            case 'ACCEPTED':
                if (hasOutclassed && !hasWarnings) {
                    return `✅ 验证通过，并可替代 ${outclassedCharms.length} 个旧护石`;
                }
                return '✅ 验证通过';
            default:
                return '✅ 验证通过';
        }
    };

    // 1. 拒绝情况 (红色)
    if (isRejected) {
        return (
            <div className="rounded-lg border p-4 border-destructive/20 bg-destructive/10">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium mb-1 text-destructive">{'⚠️ 不建议添加'}</p>
                        <ul className="text-sm space-y-1">
                            {betterCharm && (
                                <li className="text-destructive">
                                    • 完全不如现有护石: {formatCharmDetails(betterCharm, allSkills)}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // 2. 有警告的情况 (黄色)
    if (hasWarnings) {
        return (
            <div className="rounded-lg border p-4 border-warning/20 bg-warning/10">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium mb-1 text-warning-foreground">{getStatusMessage()}</p>
                        <ul className="text-sm space-y-1">
                            {warnings.map((warning, index) => (
                                <li key={`warn-${index}`} className="text-warning-foreground">
                                    • {warning}
                                </li>
                            ))}
                            {outclassedCharms?.map((charm, index) => (
                                <li key={`out-${index}`} className="text-amber-800">
                                    • 另外，它可替代旧护石: {formatCharmDetails(charm, allSkills)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // 3. 接受情况 (绿色)，包括仅有可替代项
    return (
        <div className="rounded-lg border p-4 border-green-500/20 bg-green-500/10 text-green-700">
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-medium">{getStatusMessage()}</p>
                    {hasOutclassed && (
                        <ul className="text-sm space-y-1 mt-2">
                            {outclassedCharms.map((charm, index) => (
                                <li key={`out-${index}`}>
                                    • 可移除旧护石: {formatCharmDetails(charm, allSkills)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}