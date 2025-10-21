import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { SKILL_TYPE_LABELS, SLOT_LEVEL_LABELS } from '@/types/constants';

import type { Skill, SkillType, SlotLevel } from '@/types';

interface SkillFormProps {
    skill?: Skill;
    open: boolean;
    onClose: () => void;
    onSubmit: (skill: Omit<Skill, 'id'>) => void;
    error: string | null;
    skills: Skill[];
}

/**
 * 技能表单组件
 * 用于添加或编辑技能
 */
export function SkillForm({ skill, open, onClose, onSubmit, error, skills }: SkillFormProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<SkillType>('armor');
    const [maxLevel, setMaxLevel] = useState(3);
    const [decorationLevel, setDecorationLevel] = useState<SlotLevel>(-1);
    const [isKey, setIsKey] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (skill) {
            setName(skill.name);
            setType(skill.type);
            setMaxLevel(skill.maxLevel);
            setDecorationLevel(skill.decorationLevel);
            setIsKey(skill.isKey);
        } else {
            setName('');
            setType('armor');
            setMaxLevel(3);
            setDecorationLevel(2);
            setIsKey(false);
        }
        setLocalError(null);
    }, [skill, open]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();

        // 检查名称是否重复（忽略大小写和前后空格）
        const isDuplicate = skills.some(s => {
            // 编辑模式下，排除当前编辑的技能
            if (skill) {
                return s.id !== skill.id && s.name.trim().toLowerCase() === trimmedName.toLowerCase();
            }
            return s.name.trim().toLowerCase() === trimmedName.toLowerCase();
        });

        if (isDuplicate) {
            setLocalError(`技能 "${trimmedName}" 已存在。`);
            return;
        }
        setLocalError(null);

        onSubmit({
            name: trimmedName,
            type,
            maxLevel,
            decorationLevel,
            isKey,
            description: '', // 用户自定义技能默认无描述
            skillIconType: '', // 用户自定义技能默认无图标类型
            sortId: 9999, // 用户自定义技能默认排在最后
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{skill ? '编辑技能' : '添加技能'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="name">技能名称</Label>
                        <div className="relative">
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setLocalError(null); // 输入时清除错误
                                }}
                                placeholder="输入技能名称"
                                required
                                className={(localError || error) ? "pr-20" : ""}
                            />
                            {(localError || error) && (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-destructive">
                                    {localError || error}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="type">技能类型</Label>
                        <Select value={type} onValueChange={(v) => setType(v as SkillType)}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weapon">{SKILL_TYPE_LABELS.weapon}</SelectItem>
                                <SelectItem value="armor">{SKILL_TYPE_LABELS.armor}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="maxLevel">最大等级</Label>
                            <Input
                                id="maxLevel"
                                type="number"
                                min={1}
                                max={10}
                                value={maxLevel}
                                onChange={(e) => setMaxLevel(parseInt(e.target.value))}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="decorationLevel">装饰品等级</Label>
                            <Select
                                value={decorationLevel.toString()}
                                onValueChange={(v) => setDecorationLevel(parseInt(v) as SlotLevel)}
                            >
                                <SelectTrigger id="decorationLevel">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-1">{SLOT_LEVEL_LABELS[-1]}</SelectItem>
                                    <SelectItem value="1">{SLOT_LEVEL_LABELS[1]}</SelectItem>
                                    <SelectItem value="2">{SLOT_LEVEL_LABELS[2]}</SelectItem>
                                    <SelectItem value="3">{SLOT_LEVEL_LABELS[3]}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isKey"
                            checked={isKey}
                            onCheckedChange={(checked) => setIsKey(checked as boolean)}
                        />
                        <Label htmlFor="isKey" className="cursor-pointer">
                            标记为核心技能
                        </Label>
                    </div>

                    <DialogFooter className="pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            取消
                        </Button>
                        <Button type="submit">
                            {skill ? '保存' : '添加'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}