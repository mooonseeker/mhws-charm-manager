import { cloneDeep } from 'lodash-es';
import React, { createContext, useCallback, useContext, useState } from 'react';

import { useAccessories } from '@/contexts/AccessoryContext';
import { useArmor } from '@/contexts/ArmorContext';
import { useCharms } from '@/contexts/CharmContext';
import { useSkills } from '@/contexts/SkillContext';
import { useWeapon } from '@/contexts/WeaponContext';
import { findOptimalSets } from '@/services/set-search';

import type {
    Accessory,
    Armor,
    Charm,
    EquipmentSet,
    EquipmentCellType,
    Slot,
    SkillWithLevel,
    Weapon,
} from '@/types';
import type { FinalSet } from '@/types/set-builder';
import type { ReactNode } from 'react';

export type SelectionContext =
    | { type: 'equipment'; equipmentType: EquipmentCellType }
    | { type: 'accessory'; slotType: EquipmentCellType; slotIndex: number; slot: Slot };

interface SetBuilderState {
    mode: 'manual' | 'auto';
    requiredSkills: SkillWithLevel[];
    searchResults: FinalSet[];
    isSearching: boolean;
    currentEquipmentSet: EquipmentSet;
    selectionContext: SelectionContext | null;
    isResultsModalOpen: boolean;
}

interface SetBuilderActions {
    setMode: (mode: 'manual' | 'auto') => void;
    addRequiredSkill: (skill: SkillWithLevel) => void;
    updateRequiredSkillLevel: (skillId: string, newLevel: number) => void;
    startSearch: () => Promise<void>;
    loadSetToBuilder: (set: FinalSet) => void;
    handleEqSlotClick: (type: EquipmentCellType) => void;
    handleEqSelect: (item: Armor | Weapon | Charm) => void;
    handleSlotClick: (slotType: EquipmentCellType, slotIndex: number, slot: Slot) => void;
    handleAccessorySelect: (accessory: Accessory) => void;
    setIsResultsModalOpen: (isOpen: boolean) => void;
}

const SetBuilderContext = createContext<(SetBuilderState & SetBuilderActions) | undefined>(undefined);

interface SetBuilderProviderProps {
    children: ReactNode;
}

export const SetBuilderProvider: React.FC<SetBuilderProviderProps> = ({ children }) => {
    const { armor } = useArmor();
    const { weapons } = useWeapon();
    const { accessories } = useAccessories();
    const { skills } = useSkills();
    const { charms } = useCharms();

    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [requiredSkills, setRequiredSkills] = useState<SkillWithLevel[]>([]);
    const [searchResults, setSearchResults] = useState<FinalSet[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [currentEquipmentSet, setCurrentEquipmentSet] = useState<EquipmentSet>({});
    const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

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

        setCurrentEquipmentSet(prev => ({
            ...prev,
            [selectionContext.equipmentType]: newSlottedEq,
        }));
        setSelectionContext(null);
    };

    const handleSlotClick = (slotType: EquipmentCellType, slotIndex: number, slot: Slot) => {
        setSelectionContext({ type: 'accessory', slotType, slotIndex, slot });
    };

    const handleAccessorySelect = (accessory: Accessory) => {
        if (!selectionContext || selectionContext.type !== 'accessory') return;

        const { slotType, slotIndex } = selectionContext;

        setCurrentEquipmentSet(prev => {
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

    const addRequiredSkill = (skill: SkillWithLevel) => {
        setRequiredSkills(prev => {
            const existing = prev.find(s => s.skillId === skill.skillId);
            if (existing) {
                return prev.map(s => s.skillId === skill.skillId ? { ...s, level: skill.level } : s);
            }
            return [...prev, skill];
        });
    };

    const updateRequiredSkillLevel = (skillId: string, newLevel: number) => {
        if (newLevel <= 0) {
            setRequiredSkills(prev => prev.filter(s => s.skillId !== skillId));
        } else {
            setRequiredSkills(prev =>
                prev.map(s => (s.skillId === skillId ? { ...s, level: newLevel } : s)),
            );
        }
    };

    const startSearch = useCallback(async (): Promise<void> => {
        let fixedWeapon = currentEquipmentSet.weapon?.equipment;

        if (!fixedWeapon) {
            const defaultWeapon = weapons.find(w => w.id === 'Rod_075');
            if (!defaultWeapon) {
                console.error('默认武器 "Rod_075" 未在数据库中找到。请检查数据完整性。');
                // TODO: 在未来这里应该调用一个Toast通知
                return;
            }
            fixedWeapon = defaultWeapon;
        }

        console.log('Starting a real search for skills:', requiredSkills, 'with weapon:', fixedWeapon.name);
        setIsSearching(true);
        try {
            const results = await findOptimalSets(
                requiredSkills,
                fixedWeapon,
                { armors: armor, weapons, accessories, skills, charms },
            );
            console.log('Search completed with results:', results);
            setSearchResults(results);
            if (results.length > 0) {
                setIsResultsModalOpen(true);
            }
        } catch (error) {
            console.error("An error occurred during search:", error);
            setSearchResults([]); // 出错时清空结果
        } finally {
            setIsSearching(false);
        }
    }, [requiredSkills, currentEquipmentSet, armor, weapons, accessories, skills, charms]);

    const loadSetToBuilder = (finalSet: FinalSet) => {
        console.log('[Debug] loadSetToBuilder received finalSet:', JSON.stringify(finalSet, null, 2));

        const newEquipmentSet = cloneDeep(finalSet.equipment);

        for (const key in newEquipmentSet) {
            const equipmentKey = key as keyof EquipmentSet;
            const slottedEquipment = newEquipmentSet[equipmentKey];

            if (slottedEquipment) {
                const equipmentId = slottedEquipment.equipment.id;
                const decorationsForEquipment = finalSet.decorations.get(equipmentId) || [];

                // 新增Log，用于验证decorationsForEquipment是否能取到值
                if (decorationsForEquipment.length > 0) {
                    console.log(`[Debug] Found ${decorationsForEquipment.length} decorations for equipment ${equipmentId}`);
                }

                const newAccessories = Array(slottedEquipment.equipment.slots.length).fill(null);
                decorationsForEquipment.forEach((acc, index) => {
                    if (index < newAccessories.length) {
                        newAccessories[index] = acc;
                    }
                });

                slottedEquipment.accessories = newAccessories;
            }
        }

        console.log('[Debug] Processed newEquipmentSet for UI:', JSON.stringify(newEquipmentSet, null, 2));
        setCurrentEquipmentSet(newEquipmentSet);
        setIsResultsModalOpen(false);
    };

    const value = {
        mode,
        requiredSkills,
        searchResults,
        isSearching,
        currentEquipmentSet,
        selectionContext,
        isResultsModalOpen,
        setMode,
        addRequiredSkill,
        updateRequiredSkillLevel,
        startSearch,
        loadSetToBuilder,
        handleEqSlotClick,
        handleEqSelect,
        handleSlotClick,
        handleAccessorySelect,
        setIsResultsModalOpen,
    };

    return (
        <SetBuilderContext.Provider value={value}>
            {children}
        </SetBuilderContext.Provider>
    );
};

export const useSetBuilder = () => {
    const context = useContext(SetBuilderContext);
    if (context === undefined) {
        throw new Error('useSetBuilder must be used within a SetBuilderProvider');
    }
    return context;
};