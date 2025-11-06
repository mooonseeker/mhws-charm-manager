import { AccessoryList } from '@/components/accessories';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
                <DialogHeader>
                    <DialogTitle>选择 {slot.level} 级装饰品</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto mt-4">
                    <AccessoryList
                        mode="selector"
                        onAccessorySelect={onSelect}
                        filterBySlotLevel={slot.level}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}