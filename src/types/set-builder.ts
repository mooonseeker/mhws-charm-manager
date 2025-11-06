import type { Armor, Charm, Weapon } from '@/types';
// import type { Accessory, ArmorType, Skill, Slot } from '@/types';

/** 一套完整的防具组合（不含武器和护石） */
export interface ArmorSet {
    helm: Armor;
    body: Armor;
    arm: Armor;
    waist: Armor;
    leg: Armor;
}

/** 一套完整的装备组合（包含武器、5件防具、护石） */
export interface EquipmentSet extends ArmorSet {
    weapon: Weapon;
    charm: Charm;
}