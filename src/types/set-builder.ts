import type { Accessory, Armor, Charm, Weapon, ArmorType } from '@/types';

/** 装备栏类型 */
export type EquipmentCellType = ArmorType | 'weapon' | 'charm';

/** 带有镶嵌信息的装备槽 */
export interface SlottedEquipment<T extends Weapon | Armor | Charm> {
    equipment: T;
    accessories: (Accessory | null)[]; // 数组长度应与孔位数匹配
}

/** 一套完整的防具组合（不含武器和护石） */
export interface ArmorSet {
    helm?: Armor;
    body?: Armor;
    arm?: Armor;
    waist?: Armor;
    leg?: Armor;
}

/**
 * 一套完整的装备组合（包含武器、5件防具、护石）
 * 所有属性均为可选，以支持逐步配装
 */
export interface EquipmentSet {
    weapon?: SlottedEquipment<Weapon>;
    helm?: SlottedEquipment<Armor>;
    body?: SlottedEquipment<Armor>;
    arm?: SlottedEquipment<Armor>;
    waist?: SlottedEquipment<Armor>;
    leg?: SlottedEquipment<Armor>;
    charm?: SlottedEquipment<Charm>;
}