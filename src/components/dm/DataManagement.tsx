import { Download, FileJson, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import { CharmCard } from '@/components/charms/CharmCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCharms, useSkills } from '@/contexts';
import {
    clearStorage, exportDataToJSON, importFromJSON, sortCharms, validateImportData,
    validateSkillsDatabase
} from '@/utils';

import type { Charm } from '@/types';

/**
 * 数据管理组件
 * 提供导入、导出和重置功能
 */
export function DataManagement() {
    const { skills, resetSkills, importSkills } = useSkills();
    const { charms, resetCharms, importCharms } = useCharms();
    const [importing, setImporting] = useState(false);

    // 导出选项配置
    const exportOptions = [
        {
            type: 'all' as const,
            label: '导出全部数据为 JSON',
            stats: `${skills.length} 技能 · ${charms.length} 护石`
        },
        {
            type: 'skills' as const,
            label: '导出技能数据为 JSON',
            stats: `${skills.length} 技能`
        },
        {
            type: 'charms' as const,
            label: '导出护石数据为 JSON',
            stats: `${charms.length} 护石`
        }
    ];

    // 导入选项配置
    const importOptions = [
        {
            type: 'all' as const,
            label: '导入全部数据'
        },
        {
            type: 'skills' as const,
            label: '导入技能数据'
        },
        {
            type: 'charms' as const,
            label: '导入护石数据'
        }
    ];

    // 计算最佳护石
    const bestKeySkillCharm: Charm | undefined = charms.length > 0 ? sortCharms(charms, 'keySkillValue', 'desc')[0] : undefined;
    const bestWeaponSlot1Charm: Charm | undefined = charms.length > 0 ? sortCharms(charms, 'weaponSlot1', 'desc')[0] : undefined;
    const bestArmorSlot3Charm: Charm | undefined = charms.length > 0 ? sortCharms(charms, 'armorSlot3', 'desc')[0] : undefined;
    const bestArmorSlot2Charm: Charm | undefined = charms.length > 0 ? sortCharms(charms, 'armorSlot2', 'desc')[0] : undefined;
    const bestArmorSlot1Charm: Charm | undefined = charms.length > 0 ? sortCharms(charms, 'armorSlot1', 'desc')[0] : undefined;

    // 统一导出处理函数
    const handleExport = (dataType: 'all' | 'skills' | 'charms') => {
        try {
            exportDataToJSON(dataType, skills, charms);
        } catch (error) {
            alert('导出失败：' + (error as Error).message);
        }
    };

    // 导入JSON
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, expectedType: 'all' | 'skills' | 'charms') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const data = await importFromJSON(file);
            const validation = validateImportData(data);

            if (!validation.isValid) {
                alert('导入失败：\n' + validation.errors.join('\n'));
                return;
            }

            // 验证数据类型是否匹配期望类型
            if (data.dataType !== expectedType) {
                alert(`导入失败：文件数据类型 (${data.dataType}) 与期望类型 (${expectedType}) 不匹配`);
                return;
            }

            // 根据数据类型生成确认信息和导入逻辑
            let confirmMessage = '';
            let shouldProceed = false;

            switch (data.dataType) {
                case 'all':
                    confirmMessage = `确定要导入全部数据吗？\n\n将导入 ${data.skills!.length} 个技能和 ${data.charms!.length} 个护石\n\n注意：这将覆盖当前所有数据！`;
                    shouldProceed = confirm(confirmMessage);
                    if (shouldProceed) {
                        importSkills(data.skills!);
                        importCharms(data.charms!);
                    }
                    break;
                case 'skills':
                    confirmMessage = `确定要导入技能数据吗？\n\n将导入 ${data.skills!.length} 个技能\n\n注意：这将覆盖当前的技能数据！`;
                    shouldProceed = confirm(confirmMessage);
                    if (shouldProceed) {
                        importSkills(data.skills!);
                    }
                    break;
                case 'charms':
                    confirmMessage = `确定要导入护石数据吗？\n\n将导入 ${data.charms!.length} 个护石\n\n注意：这将覆盖当前的护石数据！`;
                    shouldProceed = confirm(confirmMessage);
                    if (shouldProceed) {
                        importCharms(data.charms!);
                    }
                    break;
                default:
                    alert('导入失败：未知的数据类型');
                    return;
            }

            if (shouldProceed) {
                alert('导入成功！');
            }
        } catch (error) {
            alert('导入失败：' + (error as Error).message);
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    // 数据库验证
    const handleValidateDatabase = () => {
        try {
            const validation = validateSkillsDatabase(skills);

            if (validation.isValid) {
                alert('技能数据库验证通过！\n\n数据完全一致，技能数据库完整且正确。');
            } else {
                const errorMessage = `技能数据库验证失败：\n\n${validation.errors.join('\n')}`;
                alert(errorMessage);
            }
        } catch (error) {
            alert('验证过程中发生错误：' + (error as Error).message);
        }
    };

    // 重置数据
    const handleReset = () => {
        if (
            confirm(
                '确定要重置所有数据吗？\n\n这将清除所有技能和护石数据，并恢复到初始状态。\n\n此操作不可撤销！'
            )
        ) {
            clearStorage();
            resetSkills();
            resetCharms();
            alert('数据已重置');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-baseline">
                <h1 className="font-bold tracking-tight">数据管理</h1>
                <p className="text-foreground">管理您的技能和护石数据</p>
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                {/* 导出数据 */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            导出数据
                        </CardTitle>
                        <CardDescription>
                            将您的技能和护石数据导出为文件进行备份
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {exportOptions.map((option) => (
                            <div
                                key={option.type}
                                onClick={() => handleExport(option.type)}
                                className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full cursor-pointer"
                            >
                                <FileJson className="h-4 w-4 mr-2" />
                                {option.label}
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {option.stats}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 导入数据 */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            导入数据
                        </CardTitle>
                        <CardDescription>
                            从之前导出的 JSON 文件恢复数据
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {importOptions.map((option) => (
                            <div key={option.type}>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => handleImport(e, option.type)}
                                    disabled={importing}
                                    className="hidden"
                                    id={`import-${option.type}-input`}
                                />
                                <label htmlFor={`import-${option.type}-input`} className="block">
                                    <div
                                        className={`inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {importing ? '导入中...' : option.label}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 数据库验证 */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            数据库验证
                        </CardTitle>
                        <CardDescription>
                            验证当前技能数据与初始数据库的一致性
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleValidateDatabase}
                            variant="outline"
                            className="w-full"
                        >
                            技能
                        </Button>
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

                {/* 数据统计 */}
                <Card className="md:col-span-5">
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

                {/* 护石展示 */}
                <Card className="md:col-span-5">
                    <CardHeader>
                        <CardTitle>护石陈列柜</CardTitle>
                        <CardDescription>
                            展示在不同维度上的最佳护石
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 grid-cols-5">
                            <div className="col-span-3 grid grid-cols-3 gap-6">
                                {bestKeySkillCharm && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3 text-center">核心技能价值最高</h4>
                                        <CharmCard charm={bestKeySkillCharm} />
                                    </div>
                                )}
                                {bestWeaponSlot1Charm && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3 text-center">等效武器一级孔最多</h4>
                                        <CharmCard charm={bestWeaponSlot1Charm} />
                                    </div>
                                )}
                                {bestArmorSlot3Charm && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3 text-center">等效防具三级孔最多</h4>
                                        <CharmCard charm={bestArmorSlot3Charm} />
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-6">
                                {bestArmorSlot2Charm && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3 text-center">等效防具二级孔最多</h4>
                                        <CharmCard charm={bestArmorSlot2Charm} />
                                    </div>
                                )}
                                {bestArmorSlot1Charm && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3 text-center">等效防具一级孔最多</h4>
                                        <CharmCard charm={bestArmorSlot1Charm} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {charms.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                暂无护石数据，请先添加护石
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}