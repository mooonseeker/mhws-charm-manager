import { Card, CardContent } from '@/components/ui/card';

import type { Slot, Weapon, Armor, Charm } from '@/types';
import type { EquipmentSlotType, SlottedEquipment } from '@/types/set-builder';

export interface EquipmentSlotProps {
    type: EquipmentSlotType;
    slottedEquipment?: SlottedEquipment<Weapon | Armor | Charm>;
    onEquipmentClick: () => void;
    onSlotClick: (slotIndex: number, slot: Slot) => void;
}

const typeToLabel: Record<EquipmentSlotType, string> = {
    weapon: '武器',
    helm: '头盔',
    body: '胸甲',
    arm: '臂甲',
    waist: '腰甲',
    leg: '腿甲',
    charm: '护石',
};

const getIconPath = (type: EquipmentSlotType): string => {
    if (type === 'weapon') return '/weapon.png';
    if (type === 'charm') return '/charm.png';
    return `/armor-type/${type}.png`;
};

export function EquipmentSlot({ type, slottedEquipment, onEquipmentClick, onSlotClick }: EquipmentSlotProps) {
    const label = typeToLabel[type];
    const iconPath = getIconPath(type);
    const { equipment, accessories } = slottedEquipment || {};

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={onEquipmentClick}>
                    <img src={iconPath} alt={label} className="w-10 h-10" />
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        {equipment ? (
                            <h3 className="font-semibold">{'name' in equipment ? equipment.name : '自定义护石'}</h3>
                        ) : (
                            <p className="text-foreground/80">点击选择...</p>
                        )}
                    </div>
                </div>
                {equipment && equipment.slots.length > 0 && (
                    <div className="mt-2 pt-2 border-t flex items-center gap-2">
                        <p className="text-sm font-semibold">孔位:</p>
                        {equipment.slots.map((slot: Slot, index: number) => (
                            <div key={index} onClick={() => onSlotClick(index, slot)} className="cursor-pointer p-1 rounded-md hover:bg-accent">
                                {/* 渲染孔位图标，如果已镶嵌，则显示装饰品图标/名称 */}
                                {accessories?.[index] ? (
                                    <span>{accessories[index]!.name}</span>
                                ) : (
                                    <span>- [{slot.level}] -</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}