import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';

import { CharmForm } from './CharmForm';
import { CharmList } from './CharmList';

import type { Charm } from '@/types';

/**
 * 护石管理主组件
 * 
 * 整合所有护石相关功能：
 * - 护石列表展示（带筛选和排序）
 * - 添加护石功能
 * - 编辑护石功能
 * - 智能验证系统
 */
export function CharmManagement() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [charmToEdit, setCharmToEdit] = useState<Charm | null>(null);

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <div className="flex justify-between items-center">
                <div className="flex items-baseline">
                    <h1 className="font-bold tracking-tight">护石管理</h1>
                    <p className="text-foreground">
                        管理你的护石收藏，智能评估护石价值
                    </p>
                </div>

                {/* 添加护石按钮 */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" onClick={() => setCharmToEdit(null)}>
                            <Plus className="mr-2 h-5 w-5" />
                            添加护石
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                        <DialogHeader>
                            <DialogTitle>{charmToEdit ? '编辑护石' : '添加新护石'}</DialogTitle>
                            <DialogDescription>
                                {charmToEdit ? '修改护石信息，系统将重新计算等效孔位和核心技能价值' : '填写护石信息，系统将自动计算等效孔位和核心技能价值'}
                            </DialogDescription>
                        </DialogHeader>
                        <CharmForm
                            charmToEdit={charmToEdit}
                            onSuccess={() => {
                                setIsFormOpen(false);
                                setCharmToEdit(null);
                            }}
                            onCancel={() => {
                                setIsFormOpen(false);
                                setCharmToEdit(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* 护石列表 */}
            <CharmList
                onEdit={(charm) => {
                    setCharmToEdit(charm);
                    setIsFormOpen(true);
                }}
            />
        </div>
    );
}