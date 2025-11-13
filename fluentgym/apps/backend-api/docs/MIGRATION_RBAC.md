# Database Migration: Add RBAC Support

## Migration SQL

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'learner';

-- Update existing super_admin to have admin role
UPDATE users 
SET role = 'admin' 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

## Verification

```sql
-- Check if role column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Verify super_admin has admin role
SELECT id, email, role FROM users WHERE id = '00000000-0000-0000-0000-000000000001';
```

## Rollback (if needed)

```sql
-- Remove role column
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Drop index
DROP INDEX IF EXISTS idx_users_role;
```
