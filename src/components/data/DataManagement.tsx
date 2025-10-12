import { useState } from 'react';
import { Download, Upload, Trash2, FileJson, FileSpreadsheet } from 'lucide-react';
import { useSkills } from '@/contexts';
import { useCharms } from '@/contexts';
import {
    exportToJSON,
    exportCharmsToCSV,
    importFromJSON,
    validateImportData,
    clearStorage,
} from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 数据管理组件
 * 提供导入、导出和重置功能
 */
export function DataManagement() {
    const { skills, resetSkills, importSkills } = useSkills();
    const { charms, resetCharms, importCharms } = useCharms();
    const [importing, setImporting] = useState(false);

    // 导出JSON
    const handleExportJSON = () => {
        try {
            exportToJSON(skills, charms);
        } catch (error) {
            alert('导出失败：' + (error as Error).message);
        }
    };

    // 导出CSV
    const handleExportCSV = () => {
        try {
            exportCharmsToCSV(charms, skills);
        } catch (error) {
            alert('导出失败：' + (error as Error).message);
        }
    };

    // 导入JSON
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            if (
                confirm(
                    `确定要导入数据吗？\n\n将导入 ${data.skills.length} 个技能和 ${data.charms.length} 个护石\n\n注意：这将覆盖当前所有数据！`
                )
            ) {
                // 导入数据
                importSkills(data.skills);
                importCharms(data.charms);
                alert('导入成功！');
            }
        } catch (error) {
            alert('导入失败：' + (error as Error).message);
        } finally {
            setImporting(false);
            e.target.value = '';
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
            <div>
                <h2 className="text-2xl font-bold mb-2">数据管理</h2>
                <p className="text-slate-600">管理您的技能和护石数据</p>
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
                        <Button
                            onClick={handleExportJSON}
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <FileJson className="h-4 w-4 mr-2" />
                            导出为 JSON
                            <span className="ml-auto text-xs text-slate-500">
                                {skills.length} 技能 · {charms.length} 护石
                            </span>
                        </Button>
                        <Button
                            onClick={handleExportCSV}
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            导出护石为 CSV
                            <span className="ml-auto text-xs text-slate-500">
                                {charms.length} 护石
                            </span>
                        </Button>
                    </CardContent>
                </Card>

                {/* 导入数据 */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            导入数据
                        </CardTitle>
                        <CardDescription>
                            从之前导出的 JSON 文件恢复数据
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={importing}
                            className="hidden"
                            id="import-file-input"
                        />
                        <label htmlFor="import-file-input" className="block">
                            <div
                                className={`inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {importing ? '导入中...' : '选择 JSON 文件'}
                            </div>
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                            仅支持本应用导出的 JSON 文件
                        </p>
                    </CardContent>
                </Card>

                {/* 重置数据 */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
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
                        <p className="mt-2 text-xs text-slate-500 leading-tight">
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
                                <p className="text-sm text-slate-600">技能总数</p>
                                <p className="text-2xl font-bold">{skills.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">核心技能</p>
                                <p className="text-2xl font-bold">
                                    {skills.filter((s) => s.isKey).length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">护石总数</p>
                                <p className="text-2xl font-bold">{charms.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">平均核心技能价值</p>
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
            </div>
        </div>
    );
}