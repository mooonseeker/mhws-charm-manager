import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { Slot, Weapon, Armor, Charm } from '@/types';
import type { EquipmentCellType, SlottedEquipment } from '@/types/set-builder';

export interface EquipmentCellProps {
    type: EquipmentCellType;
    isSelected?: boolean;
    slottedEquipment?: SlottedEquipment<Weapon | Armor | Charm>;
    onEquipmentClick: () => void;
    onSlotClick: (slotIndex: number, slot: Slot) => void;
}

const typeToLabel: Record<EquipmentCellType, string> = {
    weapon: '武器',
    helm: '头盔',
    body: '胸甲',
    arm: '臂甲',
    waist: '腰甲',
    leg: '腿甲',
    charm: '护石',
};

const getIconPath = (type: EquipmentCellType): string => {
    if (type === 'weapon') return '/weapon.png';
    if (type === 'charm') return '/charm.png';
    return `/armor-type/${type}.png`;
};

const getAccessoryIcon = (slotType: 'weapon' | 'armor', level: number) => {
    const validLevel = Math.min(level, 3);
    return `/slot/${slotType}-slot-${validLevel}.png`;
};

export function EquipmentCell({ type, isSelected, slottedEquipment, onEquipmentClick, onSlotClick }: EquipmentCellProps) {
    const label = typeToLabel[type];
    const iconPath = getIconPath(type);
    const { equipment, accessories } = slottedEquipment || {};

    return (
        <Card className={cn(
            "h-full w-full", // 占满父容器
            isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}>
            <CardContent className="p-2 h-full w-full flex items-stretch gap-2" onClick={onEquipmentClick}>
                {/* 左侧图标区 */}
                <div className="w-12 aspect-square self-center flex items-center justify-center p-1 shrink-0">
                    <img src={iconPath} alt={label} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="border-l border-border/50" />

                {/* 右侧内容区 */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* 上半部分: Label + Name */}
                    <div className="flex-1 flex items-center gap-2" >
                        <div className="flex-[1] flex justify-center items-center">
                            <p className="text-sm text-muted-foreground">{label}</p>
                        </div>
                        <div className="border-l border-border/20 self-stretch my-1" />
                        <div className="flex-[5] flex items-center px-2">
                            <h3 className="font-semibold truncate text-sm">
                                {equipment ? ('name' in equipment ? equipment.name : '收藏护石') : '点击选择...'}
                            </h3>
                        </div>
                    </div>

                    <div className="border-t border-border/50" />

                    {/* 下半部分: 孔位 */}
                    <div className="flex-1 flex items-center justify-around gap-1 p-1">
                        {Array.from({ length: 3 }).map((_, index) => {
                            const slot = equipment?.slots[index];
                            const accessory = accessories?.[index];
                            const canClick = !!slot;

                            return (
                                <div
                                    key={index}
                                    onClick={(e) => {
                                        if (!canClick) return;
                                        e.stopPropagation(); // 阻止冒泡到 CardContent 的 onEquipmentClick
                                        onSlotClick(index, slot as Slot);
                                    }}
                                    className={`flex-1 h-full flex items-center gap-1 rounded-sm bg-muted/30 ${canClick ? 'cursor-pointer hover:bg-muted' : ''}`}
                                >
                                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                        {slot && (
                                            <img
                                                src={getAccessoryIcon(slot.type, slot.level)}
                                                alt={`孔位 ${slot.level}`}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 flex justify-center items-center min-w-0">
                                        <span className="text-xs truncate">
                                            {slot ? (accessory ? accessory.name : '————') : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}