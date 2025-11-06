import React from 'react';

import { ArmorList } from '@/components/armor';
import { CharmList } from '@/components/charms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { WeaponList } from '@/components/weapon';

import type { Armor, Charm, Weapon } from '@/types';

export interface EquipmentSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: Armor | Weapon | Charm) => void;
    initialTab?: 'armor' | 'weapon' | 'charm';
}

export function EquipmentSelector({ open, onOpenChange, onSelect, initialTab = 'armor' }: EquipmentSelectorProps) {
    const [currentTab, setCurrentTab] = React.useState(initialTab);

    React.useEffect(() => {
        if (open) {
            setCurrentTab(initialTab);
        }
    }, [open, initialTab]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>选择装备</DialogTitle>
                </DialogHeader>
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
                    {currentTab === 'armor' && <ArmorList mode="selector" onPieceSelect={onSelect} />}
                    {currentTab === 'weapon' && <WeaponList mode="selector" onWeaponSelect={onSelect} />}
                    {currentTab === 'charm' && <CharmList mode="selector" onCharmSelect={onSelect} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}