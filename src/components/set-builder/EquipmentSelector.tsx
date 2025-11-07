import React from 'react';

import { ArmorList } from '@/components/armor';
import { CharmList } from '@/components/charms';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { WeaponList } from '@/components/weapon';

import type { Armor, Charm, Weapon } from '@/types';
import type { EquipmentCellType } from '@/types/set-builder';

export interface EquipmentSelectorProps {
    selectingFor: EquipmentCellType;
    currentEquipment?: Armor | Weapon | Charm | null;
    onSelect: (item: Armor | Weapon | Charm) => void;
    onClose: () => void;
}

export function EquipmentSelector({ selectingFor, currentEquipment, onSelect, onClose }: EquipmentSelectorProps) {
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

    const [currentTab, setCurrentTab] = React.useState<'armor' | 'weapon' | 'charm'>(getInitialTab());

    return (
        <div className="border rounded-lg shadow-sm bg-background p-4 max-w-7xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">选择装备</h2>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-muted transition-colors"
                    aria-label="关闭"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div className="flex justify-center">
                <ToggleGroup
                    type="single"
                    value={currentTab}
                    onValueChange={(value) => value && setCurrentTab(value as 'armor' | 'weapon' | 'charm')}
                >
                    <ToggleGroupItem value="armor">防具</ToggleGroupItem>
                    <ToggleGroupItem value="weapon">武器</ToggleGroupItem>
                    <ToggleGroupItem value="charm">护石</ToggleGroupItem>
                </ToggleGroup>
            </div>
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