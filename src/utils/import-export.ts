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
 * @property dataType - 数据类型 ('all' | 'skills' | 'charms')
 * @property skills - 技能列表（可选）
 * @property charms - 护石列表（可选）
 */
export interface ExportData {
    version: string;
    exportedAt: string;
    dataType: 'all' | 'skills' | 'charms';
    skills?: Skill[];
    charms?: Charm[];
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
 * 创建包含指定类型数据的JSON文件并触发浏览器下载
 * 文件名格式根据数据类型动态生成：
 * - all: mhws-charms-YYYY-MM-DD.json
 * - skills: mhws-charms-skills-YYYY-MM-DD.json
 * - charms: mhws-charms-charms-YYYY-MM-DD.json
 *
 * @param dataType - 数据类型 ('all' | 'skills' | 'charms')
 * @param skills - 技能列表（仅当 dataType 为 'all' 或 'skills' 时有效）
 * @param charms - 护石列表（仅当 dataType 为 'all' 或 'charms' 时有效）
 *
 * @example
 * ```typescript
 * // 导出全部数据
 * exportDataToJSON('all', skills, charms);
 * // 下载文件：mhws-charms-2025-10-11.json
 *
 * // 仅导出技能
 * exportDataToJSON('skills', skills, []);
 * // 下载文件：mhws-charms-skills-2025-10-11.json
 * ```
 */
export function exportDataToJSON(
    dataType: 'all' | 'skills' | 'charms',
    skills: Skill[],
    charms: Charm[]
): void {
    const data: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        dataType,
    };

    // 根据数据类型设置相应数据
    if (dataType === 'all' || dataType === 'skills') {
        data.skills = skills;
    }
    if (dataType === 'all' || dataType === 'charms') {
        data.charms = charms;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 根据数据类型生成文件名
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = dataType === 'all'
        ? `mhws-charms-${dateStr}.json`
        : `mhws-charms-${dataType}-${dateStr}.json`;

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * @deprecated 请使用 exportDataToJSON 函数
 * 导出数据为JSON文件（兼容性函数）
 *
 * @param skills - 技能列表
 * @param charms - 护石列表
 */
export function exportToJSON(skills: Skill[], charms: Charm[]): void {
    exportDataToJSON('all', skills, charms);
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
                if (!data.version || !data.dataType) {
                    throw new Error('Invalid data format');
                }

                // 根据数据类型验证必需字段
                if (data.dataType === 'all') {
                    if (!Array.isArray(data.skills) || !Array.isArray(data.charms)) {
                        throw new Error('Invalid data format for all data type');
                    }
                } else if (data.dataType === 'skills') {
                    if (!Array.isArray(data.skills)) {
                        throw new Error('Invalid data format for skills data type');
                    }
                } else if (data.dataType === 'charms') {
                    if (!Array.isArray(data.charms)) {
                        throw new Error('Invalid data format for charms data type');
                    }
                } else {
                    throw new Error('Unknown data type');
                }

                resolve(data);
            } catch (parseError) {
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
 * 检查导入数据的完整性和正确性，根据数据类型验证相应字段
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

    if (!data.dataType) {
        errors.push('缺少数据类型信息');
    }

    // 根据数据类型验证相应字段
    if (data.dataType === 'all' || data.dataType === 'skills') {
        if (!Array.isArray(data.skills)) {
            errors.push('技能数据格式不正确');
        } else {
            // 验证技能数据
            data.skills.forEach((skill, index) => {
                if (!skill.id || !skill.name || !skill.type) {
                    errors.push(`技能 ${index + 1} 缺少必需字段`);
                }
            });
        }
    }

    if (data.dataType === 'all' || data.dataType === 'charms') {
        if (!Array.isArray(data.charms)) {
            errors.push('护石数据格式不正确');
        } else {
            // 验证护石数据
            data.charms.forEach((charm, index) => {
                if (!charm.id || !charm.rarity || !Array.isArray(charm.skills)) {
                    errors.push(`护石 ${index + 1} 缺少必需字段`);
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
