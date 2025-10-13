import { useState, useEffect } from 'react';
import type { Skill, SkillType, SlotLevel } from '@/types';
import { SKILL_TYPE_LABELS } from '@/types/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface SkillFormProps {
    skill?: Skill;
    open: boolean;
    onClose: () => void;
    onSubmit: (skill: Omit<Skill, 'id'>) => void;
}

/**
 * 技能表单组件
 * 用于添加或编辑技能
 */
export function SkillForm({ skill, open, onClose, onSubmit }: SkillFormProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<SkillType>('armor');
    const [maxLevel, setMaxLevel] = useState(3);
    const [decorationLevel, setDecorationLevel] = useState<SlotLevel>(-1);
    const [isKey, setIsKey] = useState(false);

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
    }, [skill, open]);

    // 当类型改变时，自动设置装饰品等级
    useEffect(() => {
        if (type === 'special') {
            setDecorationLevel(-1);
        } else if (decorationLevel === -1) {
            setDecorationLevel(2);
        }
    }, [type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: name.trim(),
            type,
            maxLevel,
            decorationLevel: type === 'special' ? -1 : decorationLevel,
            isKey,
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
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="输入技能名称"
                            required
                        />
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
                                <SelectItem value="special">{SKILL_TYPE_LABELS.special}</SelectItem>
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

                        {type !== 'special' && (
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
                                        <SelectItem value="1">一级</SelectItem>
                                        <SelectItem value="2">二级</SelectItem>
                                        <SelectItem value="3">三级</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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