import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/contexts';
import { cn } from '@/lib/utils';

import type { Charm } from '@/types';

/**
 * CharmCard 组件 Props 接口
 */
export interface CharmCardProps {
    /**
     * 要显示的护石对象
     */
    charm: Charm;
    /**
     * 可选的自定义 CSS 类名
     */
    className?: string;
}

/**
 * CharmCard 组件
 *
 * 显示单个护石的卡片视图，包含图标、稀有度徽章、孔位和技能列表
 */
export function CharmCard({ charm, className }: CharmCardProps) {
    const { skills } = useSkills();

    // 获取技能名称的辅助函数
    const getSkillName = (skillId: string) => {
        const skill = skills.find((s) => s.id === skillId);
        return skill?.name || '未知技能';
    };

    // 获取装饰品图标路径
    const getDecorationIcon = (slotType: 'weapon' | 'armor', level: number) => {
        return `/${slotType}-slot-${level}.png`;
    };

    return (
        <div
            className={cn(
                "charm-card border rounded-lg p-4 shadow-sm bg-card",
                className
            )}
            style={{
                borderColor: charm.rarity === 12 ? 'black' : `var(--rarity-${charm.rarity})`,
                borderWidth: charm.rarity === 12 ? '2px' : '1px'
            }}
        >
            {/* Header: 护石图标和稀有度徽章 */}
            <div className="card-header flex items-center justify-between mb-3">
                <img
                    src="/charm.png"
                    alt="Charm Icon"
                    className="charm-icon w-8 h-8"
                />
                <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                        color: charm.rarity === 12 ? 'black' : `var(--rarity-${charm.rarity})`,
                        borderColor: charm.rarity === 12 ? 'var(--border)' : `var(--rarity-${charm.rarity})`,
                        background: charm.rarity === 12 ? `var(--rarity-${charm.rarity})` : 'transparent'
                    }}
                >
                    稀有度 {charm.rarity}
                </Badge>
            </div>

            {/* Slots: 孔位图标 */}
            <div className="card-slots flex justify-center gap-2 mb-3">
                {Array.from({ length: 3 }, (_, index) => {
                    const slot = charm.slots[index];
                    return slot ? (
                        <img
                            key={index}
                            src={getDecorationIcon(slot.type, slot.level)}
                            alt={`${slot.type === 'weapon' ? 'WeaponSlot' : 'ArmorSlot'} ${slot.level}级`}
                            className="slot-icon w-6 h-6"
                        />
                    ) : (
                        <span key={index} className="text-muted-foreground text-sm" style={{ width: '1.5rem', height: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            —
                        </span>
                    );
                })}
            </div>

            {/* Skills: 技能列表 */}
            <div className="card-skills space-y-2">
                {charm.skills.map((skillWithLevel) => (
                    <div key={skillWithLevel.skillId} className="skill-item flex justify-between text-sm">
                        <span>{getSkillName(skillWithLevel.skillId)}</span>
                        <span>Lv. {skillWithLevel.level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}