// Node built-ins (tsconfig must include @types/node)
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

export type SkillPack = {
  id: string;
  name: string;
  version: string;
  type: string;
  scenarios: any[];
};

export function loadSkillPacks(root: string): SkillPack[] {
  const dir = join(root, '../../packages/skill-packs');
  const files = readdirSync(dir).filter((f: string) => ['.json'].includes(extname(f)));
  const packs: SkillPack[] = [];
  for (const f of files) {
    try {
      const raw = readFileSync(join(dir, f), 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.id && parsed.scenarios) packs.push(parsed);
    } catch (e) {
      // Ignore malformed files; this is a dev convenience loader
    }
  }
  return packs;
}
