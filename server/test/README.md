# Integration Tests

## Running Tests

**IMPORTANT:** These tests require a PostgreSQL database because the entities use ENUM types which SQLite doesn't support.

### Setup:

1. Create a test PostgreSQL database:
   ```bash
   createdb test_tickets_db
   ```

2. Set the TEST_DB_URL environment variable:
   ```bash
   export TEST_DB_URL=postgresql://postgres:password@localhost:5432/test_tickets_db
   ```

3. Run tests:
   ```bash
   npm run test:e2e
   ```

Or run with inline environment variable:
```bash
TEST_DB_URL=postgresql://postgres:password@localhost:5432/test_tickets_db npm run test:e2e
```

### Using Docker PostgreSQL (Alternative):

```bash
docker run --name test-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test_tickets_db -p 5433:5432 -d postgres:15

export TEST_DB_URL=postgresql://postgres:password@localhost:5433/test_tickets_db
npm run test:e2e
```

## Test Coverage

The integration tests cover:

- ✅ POST /api/tickets - Create ticket with validation
- ✅ GET /api/tickets - List tickets (admin vs user)
- ✅ GET /api/tickets/:id - Get single ticket
- ✅ PATCH /api/tickets/:id - Update ticket
- ✅ DELETE /api/tickets/:id - Delete ticket
- ✅ GET /api/tickets/:id/history - Get ticket history
- ✅ GET /api/tickets/:id/ai-suggestion - Get AI suggestion

All tests include:
- Authentication/authorization checks
- DTO validation
- Error handling
- Database operations

