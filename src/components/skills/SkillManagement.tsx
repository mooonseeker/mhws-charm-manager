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
    const [formError, setFormError] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingSkill(undefined);
        setFormError(null); // 打开表单时清除旧错误
        setFormOpen(true);
    };

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill);
        setFormError(null); // 打开表单时清除旧错误
        setFormOpen(true);
    };

    const handleSubmit = (skillData: Omit<Skill, 'id'>) => {
        if (editingSkill) {
            updateSkill({ ...skillData, id: editingSkill.id });
            setFormOpen(false);
        } else {
            try {
                addSkill(skillData);
                setFormOpen(false); // 成功后关闭
            } catch (error) {
                if (error instanceof Error) {
                    setFormError(error.message); // 将错误信息传递给表单
                }
            }
        }
    };

    if (loading) {
        return <Loading message="加载技能数据中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-baseline">
                    <h1 className="font-bold tracking-tight">技能管理</h1>
                    <p className="text-foreground">
                        管理技能数据，设置技能类型和装饰品等级
                    </p>
                </div>
                <Button size="lg" onClick={handleAdd}>
                    <Plus className="h-5 w-5 mr-2" />
                    添加技能
                </Button>
            </div>

            <SkillList onEdit={handleEdit} />

            <SkillForm
                skill={editingSkill}
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                error={formError}
            />
        </div>
    );
}