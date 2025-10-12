import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CharmList } from './CharmList';
import { CharmForm } from './CharmForm';

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
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    return (
        <div className="py-8 space-y-8">
            {/* 页面头部 */}
            <div className="flex items-center justify-between">
                <div className="flex items-baseline">
                    <h1 className="font-bold tracking-tight">护石管理</h1>
                    <p className="text-muted-foreground">
                        管理你的护石收藏，智能评估护石价值
                    </p>
                </div>

                {/* 添加护石按钮 */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            <Plus className="mr-2 h-5 w-5" />
                            添加护石
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                        <DialogHeader>
                            <DialogTitle>添加新护石</DialogTitle>
                            <DialogDescription>
                                填写护石信息，系统将自动计算等效孔位和核心技能价值
                            </DialogDescription>
                        </DialogHeader>
                        <CharmForm
                            onSuccess={() => setIsAddDialogOpen(false)}
                            onCancel={() => setIsAddDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* 护石列表 */}
            <Card className="shadow-sm">
                <CardHeader className="pb-6">
                    <CardTitle className="text-xl">护石列表</CardTitle>
                    <CardDescription className="text-base">
                        默认按核心技能价值和稀有度排序，点击表头可切换排序字段
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <CharmList
                        onEdit={() => {
                            // 编辑功能暂时禁用，可以后续实现
                            setIsEditDialogOpen(true);
                        }}
                    />
                </CardContent>
            </Card>

            {/* 编辑对话框（预留） */}
            {isEditDialogOpen && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>编辑护石</DialogTitle>
                            <DialogDescription>
                                编辑功能即将推出
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-8 text-center text-slate-500">
                            编辑功能正在开发中...
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => setIsEditDialogOpen(false)}>关闭</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}