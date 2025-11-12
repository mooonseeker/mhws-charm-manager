import { useState } from 'react';

import { AccessorySelector, EquipmentCell, EquipmentSelector } from '@/components/equipments';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { SetSummary } from './SetSummary';

import type { EquipmentSet, EquipmentCellType } from '@/types/set-builder';
import type { Armor, Charm, Weapon, Accessory, Slot } from '@/types';
const cellTypes: EquipmentCellType[] = ['weapon', 'helm', 'body', 'arm', 'waist', 'leg', 'charm'];

type SelectionContext =
    | { type: 'equipment'; equipmentType: EquipmentCellType }
    | { type: 'accessory'; slotType: EquipmentCellType; slotIndex: number; slot: Slot };

export function SetBuilder() {
    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [equipmentSet, setEquipmentSet] = useState<EquipmentSet>({});
    const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null);

    const handleEqSlotClick = (type: EquipmentCellType) => {
        if (selectionContext?.type === 'equipment' && selectionContext.equipmentType === type) {
            setSelectionContext(null);
        } else {
            setSelectionContext({ type: 'equipment', equipmentType: type });
        }
    };

    const handleEqSelect = (item: Armor | Weapon | Charm) => {
        if (!selectionContext || selectionContext.type !== 'equipment') return;

        const newSlottedEq = { equipment: item, accessories: Array(item.slots.length).fill(null) };
        setEquipmentSet(prev => ({ ...prev, [selectionContext.equipmentType]: newSlottedEq }));
        setSelectionContext(null);
    };

    const handleSlotClick = (slotType: EquipmentCellType, slotIndex: number, slot: Slot) => {
        setSelectionContext({ type: 'accessory', slotType, slotIndex, slot });
    };

    const handleAccessorySelect = (accessory: Accessory) => {
        if (!selectionContext || selectionContext.type !== 'accessory') return;

        const { slotType, slotIndex } = selectionContext;

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

        setSelectionContext(null);
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
                <div className="w-full lg:w-9/20 h-full flex flex-col justify-between items-start gap-2">
                    {cellTypes.map(type => (
                        <EquipmentCell
                            key={type}
                            type={type}
                            isSelected={
                                selectionContext?.type === 'equipment' &&
                                selectionContext.equipmentType === type
                            }
                            slottedEquipment={equipmentSet[type as keyof EquipmentSet]}
                            onEquipmentClick={() => handleEqSlotClick(type)}
                            onSlotClick={(slotIndex: number, slot: Slot) => handleSlotClick(type, slotIndex, slot)}
                        />
                    ))}
                </div>

                <div className="w-full lg:w-11/20 h-full overflow-y-auto">
                    {selectionContext ? (
                        selectionContext.type === 'equipment' ? (
                            <EquipmentSelector
                                selectingFor={selectionContext.equipmentType}
                                currentEquipment={equipmentSet[selectionContext.equipmentType]?.equipment}
                                onSelect={handleEqSelect}
                            />
                        ) : (
                            <AccessorySelector
                                slot={selectionContext.slot}
                                onAccessorySelect={handleAccessorySelect}
                            />
                        )
                    ) : (
                        <SetSummary equipmentSet={equipmentSet} />
                    )}
                </div>
            </div>
        </div>
    );
}