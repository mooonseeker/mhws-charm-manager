import { ArmorList } from '@/components/armor';
import { CharmList } from '@/components/charms';
import { WeaponList } from '@/components/weapon';

import type { Armor, Charm, Weapon } from '@/types';
import type { EquipmentCellType } from '@/types/set-builder';

export interface EquipmentSelectorProps {
    selectingFor: EquipmentCellType;
    currentEquipment?: Armor | Weapon | Charm | null;
    onSelect: (item: Armor | Weapon | Charm) => void;
}

export function EquipmentSelector({ selectingFor, currentEquipment, onSelect }: EquipmentSelectorProps) {
    // 根据 selectingFor 决定初始标签页
    const getInitialTab = () => {
        if (['helm', 'body', 'arm', 'waist', 'leg'].includes(selectingFor)) {
            return 'armor';
        } else if (selectingFor === 'weapon') {
            return 'weapon';
        } else if (selectingFor === 'charm') {
            return 'charm';
        }
        return 'armor'; // 默认值
    };

    const currentTab = getInitialTab();

    return (
        <div className="border rounded-lg shadow-sm bg-background p-4 max-w-7xl h-[90vh] flex flex-col">
            <div className="flex justify-end items-center mb-4" />
            <div className="flex-1 overflow-y-auto mt-4">
                {currentTab === 'armor' && (
                    <ArmorList
                        mode="selector"
                        onPieceSelect={onSelect}
                        selectingFor={selectingFor}
                        currentPiece={currentEquipment as Armor}
                    />
                )}
                {currentTab === 'weapon' && (
                    <WeaponList
                        mode="selector"
                        onWeaponSelect={onSelect}
                        selectingFor={selectingFor}
                        currentWeapon={currentEquipment as Weapon}
                    />
                )}
                {currentTab === 'charm' && (
                    <CharmList
                        mode="selector"
                        onCharmSelect={onSelect}
                        selectingFor={selectingFor}
                        currentCharm={currentEquipment as Charm}
                    />
                )}
            </div>
        </div>
    );
}