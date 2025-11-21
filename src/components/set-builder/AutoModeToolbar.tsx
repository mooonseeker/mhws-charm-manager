import { ClipboardList, RefreshCw, ScrollText, Search, Sparkles, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSetBuilder } from '@/contexts/SetBuilderContext';

export function AutoModeActions() {
    const {
        startSearch,
        resetBuilder,
        isSearching
    } = useSetBuilder();

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={startSearch}
                disabled={isSearching}
                size="sm"
            >
                <Search className="h-4 w-4 mr-2" />
                搜索
            </Button>
            {isSearching && (
                <Button variant="outline" size="sm" className="px-2.5" onClick={() => console.log('Stop clicked')}>
                    <Square className="h-4 w-4" />
                </Button>
            )}
            <Button variant="outline" size="sm" className="px-2.5" onClick={resetBuilder}>
                <RefreshCw className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function AutoModeViewToggle() {
    const {
        autoModeView,
        setAutoModeView,
    } = useSetBuilder();

    return (
        <ToggleGroup
            type="single"
            value={autoModeView}
            onValueChange={(v) => v && setAutoModeView(v as 'requirements' | 'results' | 'summary')}
            size="sm"
            className="border border-border rounded-md p-1"
        >
            <ToggleGroupItem value="requirements" aria-label="技能需求">
                <ClipboardList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="results" aria-label="搜索结果">
                <Sparkles className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="summary" aria-label="套装汇总">
                <ScrollText className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    );
}