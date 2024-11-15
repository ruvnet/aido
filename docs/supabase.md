# Supabase Documentation

## Overview

This project uses Supabase as its database and backend service provider. The local development setup includes a complete database schema with tables for agents, proposals, evaluations, tasks, and performance metrics, along with Edge Functions and Vector Storage capabilities.

## Local Development Setup

### Prerequisites
- Node.js and npm installed
- Supabase CLI installed via npm:
  ```bash
  npm install supabase --save-dev
  ```
- Docker Desktop installed and running (required for Edge Functions and Vector Storage)
- Deno installed (for Edge Functions development)

### Starting the Local Instance
```bash
cd src
npx supabase start
```

This will start all Supabase services locally with the following endpoints:
- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Database Reset
To reset the database and apply migrations/seed data:
```bash
cd src
npx supabase db reset
```

## Edge Functions

Edge Functions allow you to execute server-side code without managing a traditional server. They run on Deno and can be deployed globally.

### Creating a New Edge Function
```bash
cd src
npx supabase functions new my-function
```

This creates a new function in `supabase/functions/my-function/index.ts`.

### Function Structure
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

### Testing Functions Locally
```bash
cd src
npx supabase functions serve my-function
```

This starts a local server for your function at http://localhost:54321/functions/v1/my-function

### Invoking Functions
```typescript
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { name: 'World' }
})
```

### Secrets Management
Set secrets for local development:
```bash
npx supabase secrets set MY_SECRET=value
```

Access secrets in your function:
```typescript
const mySecret = Deno.env.get('MY_SECRET')
```

## Vector Storage

Vector Storage in Supabase is powered by pgvector, enabling similarity search and AI applications.

### Enabling Vector Storage

1. Enable the vector extension in your migration:
```sql
-- In your migration file
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table with vector column
CREATE TABLE documents (
  id bigserial PRIMARY KEY,
  content text,
  embedding vector(1536)  -- 1536 dimensions for OpenAI embeddings
);

-- Create a vector index
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### Using Vector Storage

1. Store embeddings:
```typescript
const { data, error } = await supabase
  .from('documents')
  .insert({
    content: 'Sample text',
    embedding: embedding_array // Array of numbers
  })
```

2. Perform similarity search:
```typescript
const { data, error } = await supabase
  .rpc('match_documents', {
    query_embedding: embedding_array, // Your search embedding
    match_threshold: 0.8, // Similarity threshold
    match_count: 5 // Number of records to return
  })
```

### Example Vector Search Function
Create a stored procedure for similarity search:
```sql
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

## Database Schema

### Agents Table
Stores information about AI agents in the system.
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Proposals Table
Manages proposal submissions from agents.
```sql
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    agent_specialty VARCHAR(255) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Evaluations Table
Tracks evaluations of proposals.
```sql
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id),
    score DECIMAL CHECK (score >= 0 AND score <= 100),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
Handles task assignments and tracking.
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    assigned_agent_id UUID REFERENCES agents(id),
    status VARCHAR(50) CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Performance Metrics Table
Stores system performance metrics.
```sql
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Security

### Row Level Security (RLS)
All tables have Row Level Security enabled with the following policies:

1. Read Access:
   - All users can read from all tables
   ```sql
   CREATE POLICY "Allow read access to [table]" ON [table] FOR SELECT USING (true);
   ```

2. Write Access:
   - Only authenticated users can insert data
   ```sql
   CREATE POLICY "Allow authenticated users to create [table]" ON [table] 
       FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

## Performance Optimizations

### Indexes
The following indexes are created for better query performance:
```sql
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_evaluations_proposal_id ON evaluations(proposal_id);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent_id);
```

## Sample Data

The database comes pre-populated with sample data including:
- 5 agents with different specialties
- 3 proposals with evaluations
- 3 tasks in various states
- 5 performance metrics

This data can be found in `src/supabase/seed.sql` and is automatically applied when running `npx supabase db reset`.

## Using in Application

### Connection Details
To connect your application to the local Supabase instance, use:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://127.0.0.1:54321',
  'your-anon-key' // Found in the output of `npx supabase start`
)
```

### Example Queries

1. Fetch all agents:
```typescript
const { data: agents, error } = await supabase
  .from('agents')
  .select('*')
```

2. Create a new proposal:
```typescript
const { data, error } = await supabase
  .from('proposals')
  .insert([
    {
      content: 'New proposal content',
      agent_specialty: 'Task Planning'
    }
  ])
```

3. Update task status:
```typescript
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'completed' })
  .eq('id', taskId)
```

4. Get evaluations with proposal details:
```typescript
const { data, error } = await supabase
  .from('evaluations')
  .select(`
    *,
    proposals (
      content,
      agent_specialty
    )
  `)
```

## Migrations

Database migrations are stored in `src/supabase/migrations/` and are automatically applied when running `npx supabase db reset`. The current migration file is:
- `20231201000000_initial_schema.sql`: Creates the initial database schema with all tables, indexes, and security policies.

## Troubleshooting

1. If the Supabase instance isn't starting:
   ```bash
   npx supabase stop
   npx supabase start
   ```

2. If changes to schema aren't reflecting:
   ```bash
   npx supabase db reset
   ```

3. To view logs:
   ```bash
   npx supabase logs
   ```

4. Edge Function issues:
   ```bash
   # Check function logs
   npx supabase functions logs
   
   # Restart function development server
   npx supabase functions serve --no-verify-jwt
   ```

5. Vector Storage issues:
   - Verify pgvector extension is enabled:
     ```sql
     SELECT * FROM pg_extension WHERE extname = 'vector';
     ```
   - Check vector index:
     ```sql
     SELECT * FROM pg_indexes WHERE tablename = 'your_table';
     ```

6. To access Supabase Studio:
   - Open http://127.0.0.1:54323 in your browser
   - Use the Table Editor to view and modify data
   - Use the SQL Editor to run custom queries
