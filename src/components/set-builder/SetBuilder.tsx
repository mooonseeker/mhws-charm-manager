import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { AccessorySelector } from './AccessorySelector';
import { EquipmentCell } from './EquipmentCell';
import { EquipmentSelector } from './EquipmentSelector';
import { SetSummary } from './SetSummary';

import type { EquipmentSet, EquipmentCellType } from '@/types/set-builder';
import type { Armor, Charm, Weapon, Accessory, Slot } from '@/types';
const cellTypes: EquipmentCellType[] = ['weapon', 'helm', 'body', 'arm', 'waist', 'leg', 'charm'];

export function SetBuilder() {
    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [equipmentSet, setEquipmentSet] = useState<EquipmentSet>({});
    const [isAccSelectorOpen, setIsAccSelectorOpen] = useState(false);
    const [selectingEqFor, setSelectingEqFor] = useState<EquipmentCellType | null>(null);
    const [selectingAccFor, setSelectingAccFor] = useState<{ slotType: EquipmentCellType; slotIndex: number; slot: Slot } | null>(null);

    const handleEqSlotClick = (type: EquipmentCellType) => {
        if (selectingEqFor === type) {
            setSelectingEqFor(null);
        } else {
            setSelectingEqFor(type);
        }
    };

    const handleEqSelect = (item: Armor | Weapon | Charm) => {
        if (!selectingEqFor) return;
        const newSlottedEq = { equipment: item, accessories: Array(item.slots.length).fill(null) };
        setEquipmentSet(prev => ({ ...prev, [selectingEqFor]: newSlottedEq }));
        setSelectingEqFor(null);
    };

    const handleSlotClick = (slotType: EquipmentCellType, slotIndex: number, slot: Slot) => {
        setSelectingAccFor({ slotType, slotIndex, slot });
        setIsAccSelectorOpen(true);
    };

    const handleAccessorySelect = (accessory: Accessory) => {
        if (!selectingAccFor) return;
        const { slotType, slotIndex } = selectingAccFor;

        setEquipmentSet(prev => {
            const newSet = { ...prev };
            const targetSlot = newSet[slotType as keyof EquipmentSet];
            if (targetSlot) {
                const newAccessories = [...targetSlot.accessories];
                newAccessories[slotIndex] = accessory;
                return { ...newSet, [slotType]: { ...targetSlot, accessories: newAccessories } };
            }
            return newSet;
        });
        setIsAccSelectorOpen(false);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center flex-shrink-0">
                <h1 className="text-2xl font-bold">配装器</h1>
                <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as 'manual' | 'auto')}>
                    <ToggleGroupItem value="manual">手动模式</ToggleGroupItem>
                    <ToggleGroupItem value="auto" disabled>自动模式</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 h-full flex flex-col justify-between items-start">
                    {cellTypes.map(type => (
                        <EquipmentCell
                            key={type}
                            type={type}
                            isSelected={selectingEqFor === type}
                            slottedEquipment={equipmentSet[type as keyof EquipmentSet]}
                            onEquipmentClick={() => handleEqSlotClick(type)}
                            onSlotClick={(slotIndex, slot) => handleSlotClick(type, slotIndex, slot)}
                        />
                    ))}
                </div>

                <div className="w-full lg:w-2/3 h-full overflow-y-auto">
                    {selectingEqFor ? (
                        <EquipmentSelector
                            selectingFor={selectingEqFor!}
                            currentEquipment={equipmentSet[selectingEqFor as keyof EquipmentSet]?.equipment}
                            onSelect={handleEqSelect}
                        />
                    ) : (
                        <SetSummary equipmentSet={equipmentSet} />
                    )}
                </div>
            </div>

            <AccessorySelector
                open={isAccSelectorOpen}
                onOpenChange={setIsAccSelectorOpen}
                onSelect={handleAccessorySelect}
                slot={selectingAccFor?.slot ?? null}
            />
        </div>
    );
}