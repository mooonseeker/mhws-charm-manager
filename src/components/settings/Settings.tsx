import { Trash2 } from 'lucide-react';

import { CharmShowcase } from '@/components/charms';
import { DataIO } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataStorage } from '@/services/DataStorage';

import type { Charm, Skill } from '@/types';

/**
 * 设置组件
 * 提供导入、导出和重置功能
 */
export function Settings() {
    const skills = DataStorage.loadData<Skill>('skills');
    const charms = DataStorage.loadData<Charm>('charms');

    // 重置数据
    const handleReset = () => {
        if (
            confirm(
                '确定要重置所有数据吗？\n\n这将清除所有技能和护石数据，并恢复到初始状态。\n\n此操作不可撤销！'
            )
        ) {
            DataStorage.clearAll();
            alert('数据已重置，页面将刷新。');
            window.location.reload();
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex items-baseline">
                <h1 className="font-bold tracking-tight">设置</h1>
                <p className="text-foreground">管理系统设置和数据</p>
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                {/* 数据统计 */}
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>数据统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-foreground">技能总数</p>
                                <p className="text-2xl font-bold">{skills.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">核心技能</p>
                                <p className="text-2xl font-bold">
                                    {skills.filter((s) => s.isKey).length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">护石总数</p>
                                <p className="text-2xl font-bold">{charms.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">平均核心技能价值</p>
                                <p className="text-2xl font-bold">
                                    {charms.length > 0
                                        ? (
                                            charms.reduce((sum, c) => sum + c.keySkillValue, 0) /
                                            charms.length
                                        ).toFixed(1)
                                        : '0'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 重置数据 */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            重置数据
                        </CardTitle>
                        <CardDescription>
                            清除所有数据并恢复到初始状态
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleReset}
                            variant="destructive"
                            className="w-full"
                        >
                            重置数据
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground leading-tight">
                            ⚠️ 警告：此操作将永久删除所有数据，且无法恢复！
                        </p>
                    </CardContent>
                </Card>


                {/* 数据库管理 */}
                <DataIO />

                {/* 护石展示 */}
                <CharmShowcase />
            </div>
        </div>
    );
}