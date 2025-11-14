import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSetBuilder } from '@/contexts/SetBuilderContext';
import { useSkills } from '@/contexts/SkillContext';

import type { FinalSet, Slot } from "@/types";

// Helper function to count remaining slots
const countSlots = (slots: Slot[]): Record<string, number> => {
    return slots.reduce<Record<string, number>>((acc, slot) => {
        if (slot.level > 0) {
            acc[slot.level] = (acc[slot.level] || 0) + 1;
        }
        return acc;
    }, {});
};

const SearchResultsModal = () => {
    const {
        isResultsModalOpen,
        setIsResultsModalOpen,
        searchResults,
        loadSetToBuilder,
    } = useSetBuilder();
    const { getSkillById } = useSkills();

    const handleSelectSet = (set: FinalSet) => {
        loadSetToBuilder(set);
    };

    return (
        <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Search Results</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto pr-4">
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {searchResults.map((set, index) => {
                                const remainingSlotsCount = countSlots(set.remainingSlots);

                                return (
                                    <Card
                                        key={index}
                                        className="cursor-pointer hover:border-primary transition-colors flex flex-col"
                                        onClick={() => handleSelectSet(set)}
                                    >
                                        <CardHeader>
                                            <CardTitle>Set {index + 1}</CardTitle>
                                            <CardDescription>Click to load this set</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold mb-2">Extra Skills:</h4>
                                                {set.extraSkills.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {set.extraSkills.map(({ skillId, level }) => {
                                                            const skill = getSkillById(skillId);
                                                            return (
                                                                <Badge key={skillId} variant="secondary">
                                                                    {skill?.name || skillId} Lv{level}
                                                                </Badge>
                                                            )
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">None</p>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="font-semibold mb-2">Remaining Slots:</h4>
                                                {Object.keys(remainingSlotsCount).length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(remainingSlotsCount)
                                                            .sort(([a], [b]) => Number(b) - Number(a))
                                                            .map(([slot, count]) => (
                                                                <Badge key={slot} variant="outline">
                                                                    Lv{slot} x{count}
                                                                </Badge>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">None</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No results found.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchResultsModal;