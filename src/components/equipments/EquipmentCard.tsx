import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/contexts';
import { cn } from '@/lib/utils';

import type { Equipment, Charm, Armor, Weapon } from '@/types';

/**
 * EquipmentCard 组件 Props 接口
 */
export interface EquipmentCardProps {
    /**
     * 要显示的装备对象
     */
    item: Equipment;
    /**
     * 可选的自定义 CSS 类名
     */
    className?: string;
}

/**
 * EquipmentCard 组件
 *
 * 显示单个装备的卡片视图，包含图标、稀有度徽章、孔位和技能列表
 */
export function EquipmentCard({ item, className }: EquipmentCardProps) {
    const { skills } = useSkills();

    // 获取技能名称的辅助函数
    const getSkillName = (skillId: string) => {
        const skill = skills.find((s) => s.id === skillId);
        return skill?.name || '未知技能';
    };

    // 获取装饰品图标路径
    const getAccessoryIcon = (slotType: 'weapon' | 'armor', level: number) => {
        return `/slot/${slotType}-slot-${level}.png`;
    };

    // 辅助函数：判断装备类型
    const isCharm = (item: Equipment): item is Charm => !('name' in item);
    const isWeapon = (item: Equipment): item is Weapon => 'attack' in item;
    const isArmor = (item: Equipment): item is Armor => 'resistance' in item;

    // 获取装备图标路径
    const getEquipmentIcon = (item: Equipment) => {
        if (isCharm(item)) {
            return '/charm.png';
        }
        if (isArmor(item)) {
            return `/armor-type/${item.type}.png`;
        }
        if (isWeapon(item)) {
            return `/weapon-type/${item.type}.png`;
        }
        return '/special.png'; // Fallback icon
    };

    return (
        <div
            className={cn(
                "charm-card border rounded-lg p-4 shadow-sm bg-card",
                className
            )}
            style={{
                borderColor: item.rarity === 12 ? 'black' : `var(--rarity-${item.rarity})`,
                borderWidth: item.rarity === 12 ? '2px' : '1px'
            }}
        >
            {/* Header: 装备图标和稀有度徽章 */}
            <div className="card-header flex items-center justify-between mb-3">
                <img
                    src={getEquipmentIcon(item)}
                    alt="Equipment Icon"
                    className="equipment-icon w-8 h-8"
                />
                {!isCharm(item) && <h3 className="text-sm font-semibold">{item.name}</h3>}
                <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                        color: item.rarity === 12 ? 'black' : `var(--rarity-${item.rarity})`,
                        borderColor: item.rarity === 12 ? 'var(--border)' : `var(--rarity-${item.rarity})`,
                        background: item.rarity === 12 ? `var(--rarity-${item.rarity})` : 'transparent'
                    }}
                >
                    R{item.rarity}
                </Badge>
            </div>

            {/* Stats: 核心属性 */}
            {isWeapon(item) && (
                <div className="card-stats space-y-1 mb-3 text-xs">
                    <div className="flex justify-between">
                        <span>攻击力</span>
                        <span>{item.attack}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>会心率</span>
                        <span>{item.critical}%</span>
                    </div>
                </div>
            )}
            {isArmor(item) && (
                <div className="card-stats space-y-1 mb-3 text-xs">
                    <div className="flex justify-between">
                        <span>防御力</span>
                        <span>{item.defense}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>属性耐性</span>
                        <div className="flex gap-2">
                            <span title="火耐性">🔥 {item.resistance[0]}</span>
                            <span title="水耐性">💧 {item.resistance[1]}</span>
                            <span title="雷耐性">⚡ {item.resistance[2]}</span>
                            <span title="冰耐性">❄️ {item.resistance[3]}</span>
                            <span title="龙耐性">🐲 {item.resistance[4]}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Slots: 孔位图标 */}
            <div className="card-slots flex justify-center gap-2 mb-3">
                {Array.from({ length: 3 }, (_, index) => {
                    const slot = item.slots[index];
                    return slot ? (
                        <img
                            key={index}
                            src={getAccessoryIcon(slot.type, slot.level)}
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
                {item.skills.map((skillWithLevel) => (
                    <div key={skillWithLevel.skillId} className="skill-item flex justify-between text-sm">
                        <span>{getSkillName(skillWithLevel.skillId)}</span>
                        <span>Lv. {skillWithLevel.level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}