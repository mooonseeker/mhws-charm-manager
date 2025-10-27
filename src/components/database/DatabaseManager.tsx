import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ErrorMessage, Loading } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useAccessories, useSkills } from '@/contexts';
import { generateSkillId } from '@/utils';

import { AccessoryForm } from '../accessories/AccessoryForm';
import { AccessoryList } from '../accessories/AccessoryList';
import { SkillForm } from '../skills/SkillForm';
import { SkillList } from '../skills/SkillList';

import type { Skill, Accessory } from '@/types';

/**
 * 数据库管理主组件
 * 整合技能和装饰品列表和表单功能
 */
export function DatabaseManager() {
    const {
        loading: skillsLoading,
        error: skillsError,
        addSkill,
        updateSkill,
        skills
    } = useSkills();
    const {
        loading: accessoriesLoading,
        error: accessoriesError,
        addAccessory,
        updateAccessory,
        accessories
    } = useAccessories();

    const [currentDb, setCurrentDb] = useState<'skills' | 'accessories'>('skills');
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ type: 'skill' | 'accessory'; data: Skill | Accessory } | undefined>();
    const [formError, setFormError] = useState<string | null>(null);

    const loading = skillsLoading || accessoriesLoading;
    const error = skillsError || accessoriesError;

    const handleAdd = () => {
        setEditingItem(undefined);
        setFormError(null); // 打开表单时清除旧错误
        setFormOpen(true);
    };

    const handleEdit = (item: Skill | Accessory, type: 'skill' | 'accessory') => {
        setEditingItem({ type, data: item });
        setFormError(null); // 打开表单时清除旧错误
        setFormOpen(true);
    };

    const handleSubmit = (itemData: Omit<Skill, 'id'> | Omit<Accessory, 'id'>) => {
        if (!editingItem) return;

        if (editingItem.type === 'skill') {
            const skillData = itemData as Omit<Skill, 'id'>;
            if (editingItem.data.id) {
                // 编辑模式
                try {
                    updateSkill({ ...skillData, id: editingItem.data.id });
                    setFormOpen(false);
                } catch (error) {
                    if (error instanceof Error) {
                        setFormError(error.message);
                    }
                }
            } else {
                // 添加模式
                try {
                    const newSkill: Skill = {
                        ...skillData,
                        id: generateSkillId(skillData.name),
                    };
                    addSkill(newSkill);
                    setFormOpen(false);
                } catch (error) {
                    if (error instanceof Error) {
                        setFormError(error.message);
                    }
                }
            }
        } else {
            const accessoryData = itemData as Omit<Accessory, 'id'>;
            if (editingItem.data.id) {
                // 编辑模式
                try {
                    updateAccessory({ ...accessoryData, id: editingItem.data.id });
                    setFormOpen(false);
                } catch (error) {
                    if (error instanceof Error) {
                        setFormError(error.message);
                    }
                }
            } else {
                // 添加模式
                try {
                    addAccessory(accessoryData as Accessory);
                    setFormOpen(false);
                } catch (error) {
                    if (error instanceof Error) {
                        setFormError(error.message);
                    }
                }
            }
        }
    };

    if (loading) {
        return <Loading message="加载数据库数据中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const currentItems = currentDb === 'skills' ? skills : accessories;
    const addButtonText = currentDb === 'skills' ? '添加技能' : '添加装饰品';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h1 className="font-bold tracking-tight">数据库管理</h1>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={isLocked}
                            onChange={(e) => setIsLocked(e.target.checked)}
                        />
                        <span>锁定编辑</span>
                    </label>
                </div>
                <Button size="lg" onClick={handleAdd} disabled={isLocked}>
                    <Plus className="h-5 w-5 mr-2" />
                    {addButtonText}
                </Button>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <Button
                        variant={currentDb === 'skills' ? 'default' : 'outline'}
                        onClick={() => setCurrentDb('skills')}
                    >
                        技能
                    </Button>
                    <Button
                        variant={currentDb === 'accessories' ? 'default' : 'outline'}
                        onClick={() => setCurrentDb('accessories')}
                    >
                        装饰品
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    总条目: {currentItems.length}
                </div>
            </div>

            {currentDb === 'skills' && (
                <SkillList
                    onEdit={(skill) => handleEdit(skill, 'skill')}
                    isLocked={isLocked}
                />
            )}
            {currentDb === 'accessories' && (
                <AccessoryList
                    onEdit={(accessory) => handleEdit(accessory, 'accessory')}
                    isLocked={isLocked}
                />
            )}

            {editingItem?.type === 'skill' && (
                <SkillForm
                    skill={editingItem.data as Skill}
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSubmit={handleSubmit}
                    error={formError}
                    skills={skills}
                />
            )}
            {editingItem?.type === 'accessory' && (
                <AccessoryForm
                    accessory={editingItem.data as Accessory}
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSubmit={handleSubmit}
                    error={formError}
                    accessories={accessories}
                />
            )}
        </div>
    );
}