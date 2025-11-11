import { AccessoryList } from '@/components/accessories';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import type { Accessory, Slot } from '@/types';

export interface AccessorySelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (accessory: Accessory) => void;
    slot: Slot | null;
}

export function AccessorySelector({ open, onOpenChange, onSelect, slot }: AccessorySelectorProps) {
    if (!slot) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <div className="flex-1 overflow-y-auto mt-4">
                    <AccessoryList
                        mode="selector"
                        onAccessorySelect={onSelect}
                        filterBySlotLevel={slot.level}
                        filterBySlotType={slot.type}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}