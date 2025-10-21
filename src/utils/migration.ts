import v2skillsData from '@/data/skills-1.03.0.json';

import { loadCharms, loadSkills, saveCharms, saveSkills } from './storage';

import type { Skill } from '@/types';
/**
 * 执行数据迁移函数
 *
 * 此函数负责将旧版本的护石和技能数据迁移到新版本。
 * 基于技能名称进行ID映射，确保数据连续性。
 */
export function runDataMigration() {
    const oldCharms = loadCharms();
    const oldSkills = loadSkills();
    const v2skills = v2skillsData.skills as Skill[];

    if (!oldCharms || !oldSkills) {
        // 如果没有旧数据，依然需要确保新技能库被写入
        saveSkills(v2skills);
        return;
    }

    // 基于 name 字段创建 ID 映射表
    const idMap = new Map<string, string>(); // <'skill-12345', 'HunterSkill_140'>
    const v2SkillMap = new Map(v2skills.map(s => [s.name, s]));
    oldSkills.forEach(oldSkill => {
        const newSkill = v2SkillMap.get(oldSkill.name);
        if (newSkill) idMap.set(oldSkill.id, newSkill.id);
    });

    // 遍历并更新护石数据
    const migratedCharms = oldCharms.map(charm => ({
        ...charm,
        skills: charm.skills.map(skillRef => ({
            ...skillRef,
            skillId: idMap.get(skillRef.skillId) || skillRef.skillId // 找不到则保留旧ID并警告
        }))
    }));

    // 保存新数据，此步会自动更新版本号
    saveCharms(migratedCharms);
    saveSkills(v2skills);
}