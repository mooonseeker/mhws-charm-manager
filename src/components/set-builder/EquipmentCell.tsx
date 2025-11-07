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
        <Card className={cn(isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
            <CardContent className="p-2">
                <div className="flex items-stretch gap-4 min-h-[80px]">
                    {/* 左侧：图标 */}
                    <div
                        className="flex items-center justify-center cursor-pointer shrink-0 w-[12%]"
                        onClick={onEquipmentClick}
                    >
                        <img
                            src={iconPath}
                            alt={label}
                            className="max-w-full max-h-full object-contain"
                            style={{ maxWidth: '80%', maxHeight: '80%' }}
                        />
                    </div>

                    {/* 中间：装备信息 */}
                    <div
                        className="flex flex-col justify-center cursor-pointer gap-1 border-l border-border pl-4 w-[38%] lg:w-[48%]"
                        onClick={onEquipmentClick}
                    >
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <div className="border-t border-border/50 my-1" />
                        {equipment ? (
                            <h3 className="font-semibold truncate">
                                {'name' in equipment ? equipment.name : '收藏护石'}
                            </h3>
                        ) : (
                            <p className="text-foreground/80">点击选择...</p>
                        )}
                    </div>

                    {/* 右侧：孔位 */}
                    <div className="flex-1 flex flex-col gap-1 lg:flex-none lg:w-[40%]">
                        {Array.from({ length: 3 }).map((_, index) => {
                            const slot = equipment?.slots[index];
                            const accessory = accessories?.[index];
                            const canClick = !!slot;

                            return (
                                <div
                                    key={index}
                                    onClick={() => canClick && onSlotClick(index, slot)}
                                    className={`flex items-center justify-center flex-1 px-2 py-1 rounded-md bg-muted/40 ${canClick ? 'cursor-pointer hover:bg-muted' : ''
                                        }`}
                                >
                                    {slot ? (
                                        <div className="flex items-center justify-center w-full">
                                            <img
                                                src={getAccessoryIcon(slot.type, slot.level)}
                                                alt={`孔位 ${slot.level}`}
                                                className="shrink-0 mr-2"
                                                style={{ width: '1rem', height: '1rem' }}
                                            />
                                            {accessory ? (
                                                <span className="text-sm truncate text-center flex-1">{accessory.name}</span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground text-center flex-1">——————</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}