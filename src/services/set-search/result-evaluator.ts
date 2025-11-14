import type { FinalSet, Slot } from '@/types';

/**
 * Calculates the slot value score for remaining slots.
 * @param slots Array of remaining slots
 * @returns Total slot value score (level 3 = 4, level 2 = 2, level 1 = 1)
 */
function calculateSlotValue(slots: Slot[]): number {
    return slots.reduce((total, slot) => {
        switch (slot.level) {
            case 3:
                return total + 4;
            case 2:
                return total + 2;
            case 1:
                return total + 1;
            default:
                return total;
        }
    }, 0);
}

/**
 * Calculates total defense from all equipment in the set.
 * @param set The final set to calculate defense for
 * @returns Total defense value
 */
function calculateTotalDefense(set: FinalSet): number {
    const { equipment } = set;
    let totalDefense = 0;

    // Add weapon defense
    if (equipment.weapon?.equipment.defense) {
        totalDefense += equipment.weapon.equipment.defense;
    }

    // Add armor defense
    const armorParts = ['helm', 'body', 'arm', 'waist', 'leg'] as const;
    armorParts.forEach(part => {
        const armor = equipment[part];
        if (armor?.equipment.defense) {
            totalDefense += armor.equipment.defense;
        }
    });

    // Note: Charms typically don't have defense, so we don't include them

    return totalDefense;
}

/**
 * Evaluates and sorts a list of final sets based on comprehensive criteria.
 * @param sets The list of sets to evaluate.
 * @returns A sorted list of evaluated sets.
 */
export function evaluateAndSortResults(sets: FinalSet[]): FinalSet[] {

    if (sets.length <= 1) {
        return sets;
    }

    // Sort using multi-level comparison
    return sets.sort((a, b) => {
        // 1. Compare slot value (higher is better)
        const aSlotValue = calculateSlotValue(a.remainingSlots);
        const bSlotValue = calculateSlotValue(b.remainingSlots);

        if (aSlotValue !== bSlotValue) {
            return bSlotValue - aSlotValue; // Descending order
        }

        // 2. Compare total defense (higher is better)
        const aDefense = calculateTotalDefense(a);
        const bDefense = calculateTotalDefense(b);

        if (aDefense !== bDefense) {
            return bDefense - aDefense; // Descending order
        }

        // 3. Compare extra skills count (lower is better - more precise builds)
        const aExtraSkills = a.extraSkills.length;
        const bExtraSkills = b.extraSkills.length;

        return aExtraSkills - bExtraSkills; // Ascending order
    });
}