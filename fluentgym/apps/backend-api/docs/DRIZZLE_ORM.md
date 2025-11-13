# Drizzle ORM Migration Guide

## Why We Added Drizzle ORM

**Before (Raw Supabase Client):**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('total_xp, sessions_completed')
  .eq('id', userId)
  .single();

// ❌ No type safety
// ❌ Typos in column names fail at runtime
// ❌ Schema changes break silently
```

**After (Drizzle ORM):**
```typescript
const [user] = await db
  .select({
    totalXp: schema.users.totalXp,  // ✅ Autocomplete!
    sessionsCompleted: schema.users.sessionsCompleted,
  })
  .from(schema.users)
  .where(eq(schema.users.id, userId));

// ✅ Full TypeScript type safety
// ✅ Compile-time error on typos
// ✅ Refactoring support
```

## Setup

1. **Get DB Password from Supabase:**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database
   - Copy "Database password" (or reset if needed)

2. **Add to `.env`:**
   ```bash
   SUPABASE_DB_PASSWORD=your-actual-password-here
   ```

3. **Generate migrations from existing schema:**
   ```bash
   npm run db:generate
   ```

4. **Push to database:**
   ```bash
   npm run db:push
   ```

## Benefits

| Feature | Raw Supabase | Drizzle ORM |
|---------|--------------|-------------|
| Type Safety | ❌ Runtime only | ✅ Compile-time |
| Autocomplete | ❌ No | ✅ Full IDE support |
| Refactoring | ❌ Manual search/replace | ✅ Auto-rename |
| Joins | 🟡 Limited | ✅ Full relational queries |
| Transactions | 🟡 Complex | ✅ Simple `.transaction()` |
| Migrations | ❌ Manual SQL | ✅ Generated from schema |
| Performance | ✅ Good | ✅ Same (compiles to SQL) |

## Migration Strategy

**Phase 1 (Now):**
- Coexist with Supabase client
- New routes use Drizzle
- Example: `progress.ts` refactored

**Phase 2 (Next):**
- Migrate `skill-packs.ts`
- Migrate `session-start.ts`
- Migrate `daily-plan.ts`

**Phase 3 (Later):**
- Remove `getSupabaseClient()` entirely
- 100% Drizzle ORM

## Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Push schema to database (dev)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio (DB GUI)
npm run db:studio
```

## Example: Creating a Session

```typescript
import { getDb, schema } from './db';

const db = getDb();

// Insert with full type safety
const [newSession] = await db
  .insert(schema.sessions)
  .values({
    userId: 'uuid-here',
    skillPackId: 'uuid-here',
    scenarioId: 'cafe-order',
    status: 'active',
    config: { personality: { name: 'Maria', tone: 'encouraging' } },
  })
  .returning();

// Update with type safety
await db
  .update(schema.sessions)
  .set({ status: 'completed', xpEarned: 50 })
  .where(eq(schema.sessions.id, sessionId));

// Complex query with joins
const sessionsWithPacks = await db
  .select()
  .from(schema.sessions)
  .leftJoin(schema.skillPacks, eq(schema.sessions.skillPackId, schema.skillPacks.id))
  .where(eq(schema.sessions.userId, userId));
```

## Next Steps

1. Add DB password to `.env`
2. Test progress endpoint with Drizzle
3. Gradually migrate remaining routes
4. Remove Supabase client dependency

---

**Note:** Drizzle doesn't replace Supabase Auth or Storage - just the database queries. We keep `@supabase/supabase-js` for auth, but use Drizzle for all data access.
