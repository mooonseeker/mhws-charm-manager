/**
 * MHWS护石管理器 - 常量定义
 * 
 * 包含应用中使用的所有常量
 */

import type { SkillCategory, SlotLevel } from './index';

/**
 * 稀有度最小值
 */
export const RARITY_MIN = 1;

/**
 * 稀有度最大值
 */
export const RARITY_MAX = 12;

/**
 * 护石技能数量最小值
 */
export const CHARM_SKILLS_MIN = 1;

/**
 * 护石技能数量最大值
 */
export const CHARM_SKILLS_MAX = 3;

/**
 * 护石孔位数量最小值
 */
export const CHARM_SLOTS_MIN = 0;

/**
 * 护石孔位数量最大值
 */
export const CHARM_SLOTS_MAX = 3;

/**
 * 技能分类标签映射
 */
export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
    weapon: '武器技能',
    armor: '防具技能',
    series: '套装技能',
    group: '组合技能',
};

/**
 * 孔位等级标签映射
 */
export const SLOT_LEVEL_LABELS: Record<SlotLevel, string> = {
    [-1]: '无',
    1: '一级',
    2: '二级',
    3: '三级',
};

/**
 * 核心技能价值阈值
 *
 * 用于判断护石是否低于平均水平
 */
export const KEY_SKILL_VALUE_THRESHOLD = 2;

/**
 * 技能列表每页显示数量
 */
export const SKILLS_PER_PAGE = 16;

/**
 * 护石列表每页显示数量
 */
export const CHARMS_PER_PAGE = 16;