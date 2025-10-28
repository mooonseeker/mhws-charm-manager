import { Download, RotateCcw, ShieldCheck, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';

/**
 * 数据库 IO 管理表格组件
 * 显示数据库验证、重置、导出和导入功能的统一界面
 */
export function DatabaseIO() {
    // 定义数据库类别
    const databaseItems = [
        { id: 'skills', name: '技能' },
        { id: 'accessories', name: '装饰品' },
        { id: 'armor', name: '防具' },
        { id: 'weapons', name: '武器' },
    ];

    // 定义每个类别可执行的操作
    const databaseActions = [
        { id: 'validate', label: '验证', icon: ShieldCheck },
        { id: 'reset', label: '重置', icon: RotateCcw },
        { id: 'export', label: '导出', icon: Download },
        { id: 'import', label: '导入', icon: Upload },
    ];

    return (
        <Card className="md:col-span-5">
            <CardHeader>
                <CardTitle>数据库管理</CardTitle>
                <CardDescription>
                    统一管理所有数据库的验证、重置、导出和导入功能
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center w-1/5">数据库</TableHead>
                            <TableHead className="text-center w-1/5">验证</TableHead>
                            <TableHead className="text-center w-1/5">重置</TableHead>
                            <TableHead className="text-center w-1/5">导出</TableHead>
                            <TableHead className="text-center w-1/5">导入</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {databaseItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-center font-medium">{item.name}</TableCell>
                                {databaseActions.map((action) => (
                                    <TableCell key={action.id} className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2 h-auto py-2 px-3 mx-auto"
                                            disabled
                                        >
                                            <action.icon className="h-4 w-4" />
                                            <span className="text-xs">{action.label}</span>
                                        </Button>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}