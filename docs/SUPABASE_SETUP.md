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

Supabase uses **Supavisor** as its connection pooler, which offers two modes for different use cases.

1. Click the **Connect** button in the top-right of your project dashboard
2. Select your preferred connection method

You'll need TWO connection strings:

#### Transaction Mode (for Application - Port 6543)
- Best for: Serverless functions, edge functions, and applications with many short-lived connections
- Does NOT support prepared statements
- Connection string format:
  ```
  postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  ```

#### Session Mode (for Migrations - Port 5432)
- Best for: Persistent backends, long-lived connections, and migrations
- Supports prepared statements
- Provides IPv4 support (direct connections use IPv6 by default)
- Connection string format:
  ```
  postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
  ```

#### Direct Connection (Alternative for Migrations)
- Connects directly to PostgreSQL (bypasses pooler)
- Uses IPv6 by default (requires IPv4 add-on if your environment doesn't support IPv6)
- Connection string format:
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```

### API Keys

Supabase provides two types of API keys. Navigate to **Project Settings** > **API Keys** to access them.

#### New Key Format (Recommended)
- **Settings > API Keys > API Keys tab**:
  - **Publishable Key** (`sb_publishable_...`): Safe for client-side use, respects Row Level Security
  - **Secret Key** (`sb_secret_...`): Backend-only, bypasses Row Level Security (create if needed)

#### Legacy Keys (Still Supported)
- **Settings > API Keys > Legacy tab**:
  - **anon key**: JWT token for client-side use (equivalent to publishable key)
  - **service_role key**: JWT token for backend use (equivalent to secret key)

**Note**: Both key formats work. Use the new format for new projects, but legacy keys remain fully functional.

#### Project URL
- Found in **Project Settings** > **API**
- Format: `https://[PROJECT-REF].supabase.co`

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
   SUPABASE_URL=https://[PROJECT-REF].supabase.co

   # Use either new format (sb_publishable_/sb_secret_) or legacy (anon/service_role) keys
   SUPABASE_ANON_KEY=your-publishable-or-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-secret-or-service-role-key-here

   # Database URL - Transaction mode pooler for application (port 6543)
   # IMPORTANT: Add ?prepared_statement_cache_size=0 to disable prepared statements
   DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT-REF]:your-password@aws-0-[REGION].pooler.supabase.com:6543/postgres?prepared_statement_cache_size=0

   # Session mode pooler for migrations (port 5432) - supports prepared statements
   DATABASE_URL_DIRECT=postgresql+asyncpg://postgres.[PROJECT-REF]:your-password@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

4. **Important Notes:**
   - Replace `[PROJECT-REF]` with your actual project reference (e.g., `abcdefghijklmnop`)
   - Replace `your-password` with your database password
   - Replace `[REGION]` with your actual region (e.g., `us-west-1`, `eu-central-1`)
   - **MUST** include `?prepared_statement_cache_size=0` for transaction mode (Supavisor requirement)
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

**Problem**: Error about prepared statements when using transaction mode (port 6543)

**Solution**: Supavisor transaction mode does not support prepared statements. Ensure your connection string has `?prepared_statement_cache_size=0` parameter.

**Incorrect**:
```
DATABASE_URL=postgresql+asyncpg://...@...pooler.supabase.com:6543/postgres
```

**Correct**:
```
DATABASE_URL=postgresql+asyncpg://...@...pooler.supabase.com:6543/postgres?prepared_statement_cache_size=0
```

**Alternative**: Use session mode (port 5432) which supports prepared statements.

### Migration Fails with Connection Error

**Problem**: `alembic upgrade head` fails

**Solution**: Use session mode pooler (port 5432) for migrations, which supports prepared statements:
```bash
export DATABASE_URL_DIRECT="postgresql+asyncpg://postgres.[PROJECT-REF]:password@aws-0-[REGION].pooler.supabase.com:5432/postgres"
alembic upgrade head
```

**Note**: Session mode supports prepared statements and is ideal for migrations, while transaction mode (port 6543) does not support them.

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
- [Supabase Database Connection Guide](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supavisor Connection Pooler](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## Support

If you encounter issues:
1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review application logs: `docker-compose logs backend`
3. Check Supabase logs in **Logs** section of dashboard
