import { useState } from 'react';
import { Search } from 'lucide-react';
import { useSkills } from '@/contexts';
import type { SkillWithLevel } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SkillSelectorProps {
    onSelect: (skill: SkillWithLevel) => void;
    excludeSkillIds?: string[];
}

/**
 * 技能选择器组件
 * 搜索并选择技能，设置等级
 */
export function SkillSelector({ onSelect, excludeSkillIds = [] }: SkillSelectorProps) {
    const { skills } = useSkills();
    const [search, setSearch] = useState('');
    const [selectedSkillId, setSelectedSkillId] = useState<string>('');
    const [level, setLevel] = useState(1);

    // 筛选可用技能
    const availableSkills = skills.filter(
        (s) => !excludeSkillIds.includes(s.id) && s.name.includes(search)
    );

    const selectedSkill = skills.find((s) => s.id === selectedSkillId);

    const handleAdd = () => {
        if (selectedSkillId && level > 0) {
            onSelect({ skillId: selectedSkillId, level });
            setSearch('');
            setSelectedSkillId('');
            setLevel(1);
        }
    };

    return (
        <div className="flex gap-2">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="搜索技能..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
                {search && availableSkills.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                        {availableSkills.map((skill) => (
                            <button
                                key={skill.id}
                                className="w-full text-left px-3 py-2 hover:bg-accent"
                                onClick={() => {
                                    setSelectedSkillId(skill.id);
                                    setSearch(skill.name);
                                }}
                            >
                                {skill.name} {skill.isKey && '⭐'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedSkill && (
                <Select value={level.toString()} onValueChange={(v) => setLevel(parseInt(v))}>
                    <SelectTrigger className="w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: selectedSkill.maxLevel }, (_, i) => i + 1).map((l) => (
                            <SelectItem key={l} value={l.toString()}>
                                Lv.{l}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Button onClick={handleAdd} disabled={!selectedSkillId}>
                添加
            </Button>
        </div>
    );
}