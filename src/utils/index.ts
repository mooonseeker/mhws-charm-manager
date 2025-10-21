/**
 * MHWS护石管理器 - 工具函数统一导出
 * 
 * 集中导出所有工具函数，方便其他模块引用
 */

// 护石计算工具
export {
    calculateSkillEquivalentSlots,
    calculateCharmEquivalentSlots,
    calculateKeySkillValue,
} from './charm-calculator';

// 护石验证工具
export {
    validateCharm,
    areSkillsIdentical,
    areSlotsIdentical,
} from './charm-validator';

// ID生成工具
export {
    validateIdFormat,
    generateSkillId,
    generateCharmId,
} from './id-generator';

// 护石排序工具
export {
    sortCharms,
    sortCharmsDefault,
    sortCharmsMultiple,
    filterAndSortBySkill,
} from './charm-sorter';

// LocalStorage持久化工具
export {
    saveSkills,
    loadSkills,
    saveCharms,
    loadCharms,
    clearStorage,
    getStorageVersion,
    hasStoredData,
} from './storage';

// 数据导入导出工具
export {
    exportToJSON,
    exportDataToJSON,
    importFromJSON,
    validateImportData,
} from './import-export';

// 数据迁移工具
export {
    runDataMigration,
} from './migration';

// 导入导出类型
export type {
    ExportData,
    ValidationResult,
} from './import-export';