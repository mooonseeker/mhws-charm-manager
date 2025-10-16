import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useMemo } from 'react';

import { useSkills } from '@/contexts';

import type { LucideIcon } from 'lucide-react';
import type { CharmValidationResult, Charm, Skill, CharmValidationStatus } from '@/types';

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

// 主题配置
interface ValidationTheme {
    Icon: LucideIcon;
    containerClass: string;
    iconClass: string;
    titleClass: string;
    listClass: string;
    charmListClass: string;
}

const THEMES: Record<string, ValidationTheme> = {
    SUCCESS: {
        Icon: CheckCircle,
        containerClass: "rounded-lg border p-4 border-green-500/20 bg-green-500/10 text-green-700",
        iconClass: "h-5 w-5 flex-shrink-0 mt-0.5 text-green-700",
        titleClass: "font-medium text-green-800",
        listClass: "text-green-800/90",
        charmListClass: "text-green-800/90",
    },
    WARNING: {
        Icon: Info,
        containerClass: "rounded-lg border p-4 border-warning/20 bg-warning/10",
        iconClass: "h-5 w-5 text-warning flex-shrink-0 mt-0.5",
        titleClass: "font-medium text-warning-foreground",
        listClass: "text-warning-foreground",
        charmListClass: "text-amber-800",
    },
    DESTRUCTIVE: {
        Icon: AlertTriangle,
        containerClass: "rounded-lg border p-4 border-destructive/20 bg-destructive/10",
        iconClass: "h-5 w-5 text-destructive flex-shrink-0 mt-0.5",
        titleClass: "font-medium mb-1 text-destructive",
        listClass: "text-destructive",
        charmListClass: "text-destructive",
    },
};

// 集中处理状态信息
const getStatusMessage = (status: CharmValidationStatus): string => {
    switch (status) {
        case 'REJECTED_AS_INFERIOR':
            return '验证不通过';
        case 'ACCEPTED_AS_FIRST':
            return '1️⃣ 欢迎添加第一个护石';
        case 'ACCEPTED_BY_MAX_VALUE':
            return '🥇 核心技能价值达到新高！';
        case 'ACCEPTED_BY_MAX_SLOTS':
            return '🌟 等效孔位数量达到新高！';
        case 'ACCEPTED_AS_UNIQUE_SKILL':
            return '✨ 带全新技能的护石';
        case 'ACCEPTED':
            return '验证通过';
        default:
            return '验证通过';
    }
};

/**
 * 护石验证提示组件（重构版）
 * 显示来自新验证逻辑的详细信息
 */
export function CharmValidation({ validation }: CharmValidationProps) {
    const { skills: allSkills } = useSkills();

    // 使用 useMemo 优化性能，避免在每次渲染时都重新计算
    const displayConfig = useMemo(() => {
        if (!validation) {
            return null;
        }

        const { status, warnings, betterCharm, outclassedCharms } = validation;

        const isRejected = status === 'REJECTED_AS_INFERIOR';
        const hasWarnings = !!warnings?.length;

        // 1. 决定主题
        const theme = isRejected
            ? THEMES.DESTRUCTIVE
            : hasWarnings
                ? THEMES.WARNING
                : THEMES.SUCCESS;

        // 2. 获取主信息
        const message = getStatusMessage(status);

        // 3. 整合所有详细信息（警告和护石列表）
        const detailItems: { key: string; text: string; className: string }[] = [];

        // 添加警告信息
        warnings?.forEach((warning, index) => {
            detailItems.push({
                key: `warn-${index}`,
                text: `• ${warning}`,
                className: theme.listClass,
            });
        });

        // 如果被拒绝，显示更优护石
        if (betterCharm) {
            detailItems.push({
                key: 'better-charm',
                text: `• 上位替代: ${formatCharmDetails(betterCharm, allSkills)}`,
                className: theme.charmListClass,
            });
        }

        // 显示可被替代的旧护石
        outclassedCharms?.forEach((charm, index) => {
            detailItems.push({
                key: `out-${index}`,
                text: `• 下位替代: ${formatCharmDetails(charm, allSkills)}`,
                className: theme.charmListClass,
            });
        });

        return {
            theme,
            message,
            detailItems,
        };
    }, [validation, allSkills]);

    if (!displayConfig) {
        return null;
    }

    const { theme, message, detailItems } = displayConfig;
    const { Icon, containerClass, iconClass, titleClass } = theme;

    return (
        <div className={containerClass}>
            <div className="flex items-start gap-3">
                <Icon className={iconClass} />
                <div className="flex-1">
                    <p className={titleClass}>{message}</p>
                    {detailItems.length > 0 && (
                        <ul className="text-sm space-y-1 mt-2">
                            {detailItems.map(item => (
                                <li key={item.key} className={item.className}>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}