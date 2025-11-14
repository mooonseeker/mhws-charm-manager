import { List, RefreshCw, Search } from 'lucide-react';

import { SkillSelector } from '@/components/skills';
import { Button } from '@/components/ui/button';
import { useSetBuilder } from '@/contexts/SetBuilderContext';

export function AutoModeToolbar() {
    const { addRequiredSkill, startSearch, requiredSkills, setIsResultsModalOpen, searchResults } = useSetBuilder();

    return (
        <div className="flex-1 flex justify-end items-center gap-2">
            <div className="w-64">
                <SkillSelector
                    onSelect={addRequiredSkill}
                    excludeSkillIds={requiredSkills.map(s => s.skillId)}
                />
            </div>
            <Button variant="outline" size="icon" onClick={() => console.log('Reset clicked')}>
                <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={startSearch}>
                <Search className="h-4 w-4 mr-2" />
                搜索
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsResultsModalOpen(true)}
                disabled={searchResults.length === 0}
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}