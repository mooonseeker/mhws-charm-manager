// Report: Total 176 skills, 121 merged from old data, 55 new skills

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Types
interface OldSkill {
    name: string;
    type: string;
    maxLevel: number;
    decorationLevel: number;
    isKey: boolean;
    id: string;
}

interface NewSkill {
    id: string;
    name: string;
    type: 'armor' | 'weapon' | 'series' | 'group';
    maxLevel: number;
    decorationLevel: number;
    isKey: boolean;
    description: string;
    skillIconType: string;
    sortId: number;
}

interface CsvSkillRow {
    Index: string;
    skillId: string;
    skillType: string;
    skillCategory: string;
    SkillIconType: string;
    skillName: string;
    skillExplain: string;
    SortId: string;
}

// Skill type mapping
const skillTypeMap: { [key: string]: NewSkill['type'] } = {
    '[0]EQUIP': 'armor',
    '[3]WEAPON': 'weapon',
    '[2]GROUP': 'group',
    '[1]SERIES': 'series',
};

// Main function
function generateSkillsJson(): void {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..');

    // Read CSV data
    const csvPath = path.join(projectRoot, 'src/data/SkillCommonData.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV (simple parser for this specific format)
    const csvLines = csvContent.split('\n').slice(1); // Skip header
    const csvSkills: CsvSkillRow[] = csvLines
        .filter(line => line.trim())
        .map(line => {
            const [Index, skillId, skillType, skillCategory, SkillIconType, skillName, skillExplain, SortId] = line.split(',');
            return {
                Index,
                skillId: skillId.replace(/^\[.*?\]/, ''), // Remove [anything] from start
                skillType,
                skillCategory,
                SkillIconType: SkillIconType.replace(/^\[.*?\]/, ''), // Remove [anything] from start
                skillName: skillName.replace(/^"/, '').replace(/"$/, ''), // Remove quotes if present
                skillExplain: skillExplain.replace(/^"/, '').replace(/"$/, ''), // Remove quotes if present
                SortId: SortId?.trim() || '0',
            };
        });

    // Read old skills data
    const oldSkillsPath = path.join(projectRoot, 'src/data/mhws-charms-skills-2025-10-21.json');
    const oldSkillsData = JSON.parse(fs.readFileSync(oldSkillsPath, 'utf-8'));
    const oldSkills: OldSkill[] = oldSkillsData.skills;

    // Create map for quick lookup by name
    const oldSkillsMap = new Map<string, OldSkill>();
    oldSkills.forEach(skill => {
        oldSkillsMap.set(skill.name, skill);
        // Handle special cases with different connectors - map old & to new · for lookup
        if (skill.name.includes('&')) {
            oldSkillsMap.set(skill.name.replace('&', '·'), skill);
        }
    });

    // Generate new skills
    let mergedCount = 0;
    let newCount = 0;
    const newSkills: NewSkill[] = csvSkills
        .filter(csvSkill => csvSkill.SkillIconType !== 'INVALID')
        .map(csvSkill => {
            const oldSkill = oldSkillsMap.get(csvSkill.skillName);

            if (oldSkill) {
                // Merge with old data
                mergedCount++;
                return {
                    id: csvSkill.skillId,
                    name: csvSkill.skillName,
                    type: skillTypeMap[csvSkill.skillCategory] || 'armor',
                    maxLevel: oldSkill.maxLevel,
                    decorationLevel: oldSkill.decorationLevel,
                    isKey: oldSkill.isKey,
                    description: csvSkill.skillExplain,
                    skillIconType: csvSkill.SkillIconType,
                    sortId: parseInt(csvSkill.SortId, 10),
                };
            } else {
                // New skill, use defaults
                newCount++;
                return {
                    id: csvSkill.skillId,
                    name: csvSkill.skillName,
                    type: skillTypeMap[csvSkill.skillCategory] || 'armor',
                    maxLevel: 10,
                    decorationLevel: -1,
                    isKey: false,
                    description: csvSkill.skillExplain,
                    skillIconType: csvSkill.SkillIconType,
                    sortId: parseInt(csvSkill.SortId, 10),
                };
            }
        });

    // Write output with old format
    const outputData = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        dataType: "skills",
        skills: newSkills,
    };
    const outputPath = path.join(projectRoot, 'src/data/skills-1.03.0.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

    console.log(`Generated ${newSkills.length} skills and saved to ${outputPath}`);
    console.log(`Report: Total ${newSkills.length} skills, ${mergedCount} merged from old data, ${newCount} new skills`);
}

// Run the script
generateSkillsJson();
