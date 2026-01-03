# Supabase Setup Guide

This guide walks you through setting up Supabase PostgreSQL as the database for the Crime Statistics API.

## Prerequisites

- Supabase account (free tier available)
- Project cloned locally
- Basic knowledge of SQL

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create a new account
3. Click **"New Project"**
4. Fill in the project details:
   - **Organization**: Select or create an organization
   - **Project Name**: `crime-statistics` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the region closest to your VPS deployment
     - `us-west-1` (N. California)
     - `us-east-1` (N. Virginia)
     - `eu-west-1` (Ireland)
     - etc.
   - **Pricing Plan**: Free tier is sufficient to start
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning to complete

## Step 2: Run Database Schema

1. In your Supabase dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `backend/scripts/supabase_schema.sql` from your local project
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Verify success - you should see a green checkmark

### Verify Tables Created

Run this verification query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 4 tables:
- `calculated_statistics`
- `crime_statistics`
- `data_sources`
- `population_data`

## Step 3: Get Connection Credentials

### Database Connection Strings

1. Navigate to **Project Settings** (gear icon in left sidebar)
2. Click **Database** in the settings menu
3. Scroll to **Connection string** section
4. You'll need TWO connection strings:

#### Pooled Connection (for Application)
- Select **"Connection Pooling"** mode
- Port: **6543**
- Copy the URI format connection string
- Example:
  ```
  postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
  ```

#### Direct Connection (for Migrations)
- Select **"Session"** mode
- Port: **5432**
- Copy the URI format connection string
- Example:
  ```
  postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
  ```

### API Credentials

1. Navigate to **Project Settings** > **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: Long JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role** key: Another JWT token (keep this secret!)

## Step 4: Configure Environment Variables

1. Navigate to your project's backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and update these values:

   ```bash
   # Supabase Configuration
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Database URL - Pooled connection for application
   # IMPORTANT: Add ?prepared_statement_cache_size=0 at the end
   DATABASE_URL=postgresql+asyncpg://postgres.xxxxx:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?prepared_statement_cache_size=0

   # Direct connection for migrations
   DATABASE_URL_DIRECT=postgresql+asyncpg://postgres.xxxxx:your-password@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```

4. **Important Notes:**
   - Replace `xxxxx` with your actual project reference
   - Replace `your-password` with your database password
   - Replace `aws-0-us-west-1` with your actual region
   - **MUST** include `?prepared_statement_cache_size=0` for pooled connection (PgBouncer requirement)
   - Do **NOT** commit the `.env` file to version control

## Step 5: Test Connection

### Test from Python

Create a test script or run this in your Python environment:

```bash
cd backend
python3 -c "
import asyncio
from app.database import engine

async def test():
    async with engine.connect() as conn:
        result = await conn.execute('SELECT 1 as test')
        print('✓ Supabase connection successful!')
        print(f'  Result: {result.scalar()}')

asyncio.run(test())
"
```

Expected output:
```
✓ Supabase connection successful!
  Result: 1
```

### Test Migrations

Run Alembic to ensure migrations work:

```bash
cd backend
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
```

## Step 6: Verify in Supabase Dashboard

1. Go to **Table Editor** in Supabase dashboard
2. You should see all 4 tables listed
3. Click on `data_sources` - should show column structure
4. All tables should show 0 rows initially

## Common Issues & Troubleshooting

### Connection Timeout

**Problem**: Can't connect to Supabase database

**Solutions**:
1. Check if your IP is allowed:
   - Go to **Project Settings** > **Database**
   - Under **Connection pooling**, verify **"Restrict access to IPv4"** is disabled
   - Or add your IP to the allowlist
2. Verify firewall settings allow outbound connections on ports 5432 and 6543
3. Check connection string format is correct

### "prepared statement cache" Error

**Problem**: Error about prepared statements

**Solution**: Ensure pooled connection has `?prepared_statement_cache_size=0` parameter

**Incorrect**:
```
DATABASE_URL=postgresql+asyncpg://...@...pooler.supabase.com:6543/postgres
```

**Correct**:
```
DATABASE_URL=postgresql+asyncpg://...@...pooler.supabase.com:6543/postgres?prepared_statement_cache_size=0
```

### Migration Fails with Connection Error

**Problem**: `alembic upgrade head` fails

**Solution**: Use the direct connection (port 5432) for migrations:
```bash
export DATABASE_URL_DIRECT="postgresql+asyncpg://postgres.xxxxx:password@...pooler.supabase.com:5432/postgres"
alembic upgrade head
```

### Table Already Exists Error

**Problem**: Error when running schema SQL: "relation already exists"

**Solutions**:
1. If this is expected (re-running), drop tables first:
   ```sql
   DROP TABLE IF EXISTS calculated_statistics CASCADE;
   DROP TABLE IF EXISTS crime_statistics CASCADE;
   DROP TABLE IF EXISTS population_data CASCADE;
   DROP TABLE IF EXISTS data_sources CASCADE;
   DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
   ```
2. Then re-run the schema SQL

## Next Steps

After successful Supabase setup:

1. **Start the application locally**:
   ```bash
   cd backend
   make dev
   ```

2. **Test API endpoints**:
   ```bash
   curl http://localhost:8000/health
   ```

3. **Run Celery worker** (in a new terminal):
   ```bash
   cd backend
   make celery-worker
   ```

4. **Deploy to VPS** (when ready):
   - See [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for deployment guide
   - Configure environment variables on VPS
   - Set up systemd services

## Security Best Practices

1. **Never commit `.env` to git**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Rotate database password regularly**
   - Update in Supabase dashboard
   - Update in your `.env` file

3. **Use service_role key carefully**
   - Bypasses Row Level Security (RLS)
   - Only use in backend, never expose to frontend

4. **Enable Point-in-Time Recovery (PITR)**
   - Go to **Project Settings** > **Backups**
   - Enable PITR for production data

5. **Monitor usage**
   - Check **Database** > **Usage** in dashboard
   - Free tier: 500 MB database size, 2 GB bandwidth/month

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## Support

If you encounter issues:
1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review application logs: `docker-compose logs backend`
3. Check Supabase logs in **Logs** section of dashboard
