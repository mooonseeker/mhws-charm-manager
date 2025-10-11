import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSkills } from '@/contexts';
import type { Skill } from '@/types';
import { Button } from '@/components/ui/button';
import { SkillList } from './SkillList';
import { SkillForm } from './SkillForm';
import { Loading, ErrorMessage } from '@/components/common';

/**
 * 技能管理主组件
 * 整合技能列表和表单功能
 */
export function SkillManagement() {
    const { loading, error, addSkill, updateSkill } = useSkills();
    const [formOpen, setFormOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | undefined>();

    const handleAdd = () => {
        setEditingSkill(undefined);
        setFormOpen(true);
    };

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill);
        setFormOpen(true);
    };

    const handleSubmit = (skillData: Omit<Skill, 'id'>) => {
        if (editingSkill) {
            updateSkill({ ...skillData, id: editingSkill.id });
        } else {
            addSkill(skillData);
        }
    };

    if (loading) {
        return <Loading message="加载技能数据中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">技能管理</h2>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加技能
                </Button>
            </div>

            <SkillList onEdit={handleEdit} />

            <SkillForm
                skill={editingSkill}
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
}