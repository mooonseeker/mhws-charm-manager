/**
 * MHWS护石管理器 - 数据库验证工具
 *
 * 用于验证当前存储的技能数据是否与初始数据库完全一致
 */

import initialSkillsData from '../data/initial-skills.json';

import type { Skill } from '../types';

/**
 * 验证技能数据库的完整性
 *
 * 比对当前存储的技能与初始技能数据库的严格一致性：
 * - 数量必须完全相等
 * - 每个技能的id必须存在且所有属性值完全相同
 *
 * @param currentSkills - 当前存储的技能列表
 * @returns 验证结果对象
 */
export function validateSkillsDatabase(currentSkills: Skill[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    // 类型断言
    const initialSkills = initialSkillsData.skills as Skill[];

    // 1. 检查数量是否一致
    if (currentSkills.length !== initialSkills.length) {
        errors.push(`技能数量不匹配：当前 ${currentSkills.length} 个，初始 ${initialSkills.length} 个`);
    }

    // 2. 创建初始技能的id映射，便于快速查找
    const initialSkillsMap = new Map<string, Skill>();
    initialSkills.forEach((skill: Skill) => {
        initialSkillsMap.set(skill.id, skill);
    });

    // 3. 检查当前技能：每个技能必须在初始数据中存在，且所有属性完全相同
    currentSkills.forEach((currentSkill) => {
        const initialSkill = initialSkillsMap.get(currentSkill.id);

        if (!initialSkill) {
            errors.push(`技能ID "${currentSkill.id}" 在初始数据库中不存在`);
            return;
        }

        // 深度比较所有属性
        const skillKeys = Object.keys(currentSkill) as (keyof Skill)[];
        skillKeys.forEach(key => {
            if (currentSkill[key] !== initialSkill[key]) {
                errors.push(`技能 "${currentSkill.name}" (ID: ${currentSkill.id}) 的属性 "${key}" 不匹配：当前 "${currentSkill[key]}"，初始 "${initialSkill[key]}"`);
            }
        });
    });

    // 4. 反向检查：确保所有初始技能都存在于当前数据中
    initialSkills.forEach((initialSkill: Skill) => {
        const currentSkill = currentSkills.find(s => s.id === initialSkill.id);
        if (!currentSkill) {
            errors.push(`初始技能 "${initialSkill.name}" (ID: ${initialSkill.id}) 在当前数据中不存在`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}