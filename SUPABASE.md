# Local Supabase Setup

This guide explains how to run Supabase locally for development and testing.

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for running the application)

## Setup Instructions

1. **Start Supabase Services**

```bash
docker-compose up -d
```

This will start all necessary services:
- PostgreSQL database (port 5432)
- Supabase Studio (port 3000)
- Kong API Gateway (port 8000)
- GoTrue Auth (port 9999)
- PostgREST (port 3001)
- Realtime (port 4000)
- Postgres Meta (port 8081)

2. **Access Supabase Studio**

Once the services are running, you can access Supabase Studio at:
```
http://localhost:3000
```

3. **Database Connection Details**

Use these details to connect to the local PostgreSQL database:
```
Host: localhost
Port: 5432
Database: postgres
User: postgres
Password: postgres
```

4. **API URLs**

- REST API: `http://localhost:8000/rest/v1/`
- Authentication: `http://localhost:8000/auth/v1/`
- Realtime: `http://localhost:8000/realtime/v1/`

5. **Environment Variables**

The following environment variables are set up for local development:
```
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV9cklpv9e9R44_-OQY3o4RypHKFnl_Mk
```

## Database Schema

The local database is initialized with the following tables:
- `proposals`: Stores proposal data for consensus algorithm
- `evaluations`: Stores evaluation data for proposals
- `tasks`: Stores task allocation data
- `agents`: Stores agent information
- `performance_metrics`: Stores agent performance metrics

## Testing

The local Supabase instance includes sample data for testing. You can:
1. View and manage data through Supabase Studio
2. Make API requests to the local endpoints
3. Test authentication flows
4. Monitor realtime subscriptions

## Stopping Services

To stop all Supabase services:
```bash
docker-compose down
```

To stop and remove all data (clean slate):
```bash
docker-compose down -v
```

## Troubleshooting

1. **Services Not Starting**
   - Check if ports are available (3000, 8000, 5432, etc.)
   - Ensure Docker is running
   - Check Docker logs: `docker-compose logs -f`

2. **Database Connection Issues**
   - Verify PostgreSQL is running: `docker-compose ps`
   - Check database logs: `docker-compose logs db`
   - Ensure correct connection details are being used

3. **API Errors**
   - Check Kong logs: `docker-compose logs kong`
   - Verify JWT tokens are correctly configured
   - Check if services are healthy: `docker-compose ps`

## Development Workflow

1. Start local Supabase services
2. Make changes to your application code
3. Test against local endpoints
4. Use Supabase Studio to verify data changes
5. Monitor logs for debugging

Remember to use the local endpoints in your application's development environment to ensure you're working with the local Supabase instance.
