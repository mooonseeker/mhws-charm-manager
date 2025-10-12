/**
 * MHWS护石管理器 - 初始技能数据
 * 
 * 包含应用预设的技能数据
 */

import type { Skill } from '@/types';

/**
 * 初始技能列表
 * 
 * 目前包含示例技能"精神抖擞"
 */
export const initialSkills: Skill[] = [
    {
        id: 'skill-001',
        name: '精神抖擞',
        type: 'armor',
        maxLevel: 3,
        decorationLevel: 2,
        isKey: true,
    },
];