/**
 * MHWS护石管理器 - 数据导入导出工具
 * 
 * 提供JSON和CSV格式的数据导入导出功能
 */

import type { Skill, Charm } from '@/types';

/**
 * 数据导出格式
 * 
 * @property version - 数据格式版本号
 * @property exportedAt - 导出时间（ISO 8601格式）
 * @property skills - 技能列表
 * @property charms - 护石列表
 */
export interface ExportData {
    version: string;
    exportedAt: string;
    skills: Skill[];
    charms: Charm[];
}

/**
 * 数据验证结果
 * 
 * @property isValid - 是否通过验证
 * @property errors - 错误消息列表
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * 导出数据为JSON文件
 * 
 * 创建包含技能和护石数据的JSON文件并触发浏览器下载
 * 文件名格式：mhws-charms-YYYY-MM-DD.json
 * 
 * @param skills - 技能列表
 * @param charms - 护石列表
 * 
 * @example
 * ```typescript
 * exportToJSON(skills, charms);
 * // 下载文件：mhws-charms-2025-10-11.json
 * ```
 */
export function exportToJSON(skills: Skill[], charms: Charm[]): void {
    const data: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        skills,
        charms,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mhws-charms-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 从JSON文件导入数据
 * 
 * 读取JSON文件并解析为ExportData格式
 * 
 * @param file - 要导入的JSON文件
 * @returns Promise，成功时返回解析后的数据，失败时抛出错误
 * @throws {Error} 当文件读取失败或格式不正确时抛出错误
 * 
 * @example
 * ```typescript
 * try {
 *   const data = await importFromJSON(file);
 *   console.log('导入成功:', data.skills.length, '个技能');
 * } catch (error) {
 *   console.error('导入失败:', error.message);
 * }
 * ```
 */
export function importFromJSON(file: File): Promise<ExportData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content) as ExportData;

                // 基础验证
                if (!data.version || !data.skills || !data.charms) {
                    throw new Error('Invalid data format');
                }

                resolve(data);
            } catch (error) {
                reject(new Error('导入失败：文件格式不正确'));
            }
        };

        reader.onerror = () => {
            reject(new Error('读取文件失败'));
        };

        reader.readAsText(file);
    });
}

/**
 * 验证导入的数据
 * 
 * 检查导入数据的完整性和正确性
 * 
 * @param data - 要验证的导入数据
 * @returns 验证结果，包含是否有效和错误列表
 * 
 * @example
 * ```typescript
 * const result = validateImportData(importedData);
 * if (!result.isValid) {
 *   console.error('验证失败:', result.errors);
 * }
 * ```
 */
export function validateImportData(data: ExportData): ValidationResult {
    const errors: string[] = [];

    // 检查必需字段
    if (!data.version) {
        errors.push('缺少版本信息');
    }

    if (!Array.isArray(data.skills)) {
        errors.push('技能数据格式不正确');
    }

    if (!Array.isArray(data.charms)) {
        errors.push('护石数据格式不正确');
    }

    // 验证技能数据
    if (Array.isArray(data.skills)) {
        data.skills.forEach((skill, index) => {
            if (!skill.id || !skill.name || !skill.type) {
                errors.push(`技能 ${index + 1} 缺少必需字段`);
            }
        });
    }

    // 验证护石数据
    if (Array.isArray(data.charms)) {
        data.charms.forEach((charm, index) => {
            if (!charm.id || !charm.rarity || !Array.isArray(charm.skills)) {
                errors.push(`护石 ${index + 1} 缺少必需字段`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * 导出护石为CSV格式
 * 
 * 将护石列表导出为CSV文件，包含稀有度、技能、孔位等信息
 * 使用UTF-8 BOM以确保中文正确显示
 * 文件名格式：mhws-charms-YYYY-MM-DD.csv
 * 
 * @param charms - 护石列表
 * @param skills - 技能列表（用于查找技能名称）
 * 
 * @example
 * ```typescript
 * exportCharmsToCSV(charms, skills);
 * // 下载文件：mhws-charms-2025-10-11.csv
 * ```
 */
export function exportCharmsToCSV(charms: Charm[], skills: Skill[]): void {
    // 创建技能ID到名称的映射
    const skillMap = new Map(skills.map(s => [s.id, s.name]));

    // CSV头部
    const headers = [
        '稀有度',
        '技能1',
        '技能1等级',
        '技能2',
        '技能2等级',
        '技能3',
        '技能3等级',
        '孔位',
        '核心技能价值',
        '创建时间',
    ];

    // CSV内容
    const rows = charms.map(charm => {
        const skillsData = charm.skills.map(s => ({
            name: skillMap.get(s.skillId) || s.skillId,
            level: s.level,
        }));

        // 补齐到3个技能
        while (skillsData.length < 3) {
            skillsData.push({ name: '', level: 0 });
        }

        const slotsStr = charm.slots
            .map(s => `${s.type === 'weapon' ? 'W' : 'A'}${s.level}`)
            .join(',');

        return [
            charm.rarity,
            skillsData[0].name,
            skillsData[0].level || '',
            skillsData[1].name,
            skillsData[1].level || '',
            skillsData[2].name,
            skillsData[2].level || '',
            slotsStr,
            charm.keySkillValue,
            new Date(charm.createdAt).toLocaleString('zh-CN'),
        ];
    });

    // 构建CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    // 下载（使用UTF-8 BOM确保中文正确显示）
    const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mhws-charms-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}