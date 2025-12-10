# Prisma Migrations — Baseline & Deploy

This repo uses **Prisma Migrate** with versioned SQL in `prisma/migrations/`.

## One-time: create a baseline migration

If this is the first migration and database is empty, generate SQL from the datamodel:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0001_init/migration.sql
git add prisma/migrations/0001_init/migration.sql
git commit -m "chore(prisma): baseline migration"
```

If you already have a live database with data, create a baseline that **does not** modify data:

```bash
# 1) Introspect current DB to a temp schema file
npx prisma db pull --schema=prisma/schema.prisma

# 2) Diff from current DB to your desired schema
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0001_init/migration.sql
```

Review the SQL carefully before applying to production.

## Commands

```bash
npm run migrate:baseline   # generate baseline SQL into 0001_init/migration.sql
npm run migrate:deploy     # apply committed migrations to target DB
```

## CI/CD

- CI will run `prisma migrate deploy` on `main` branch using the `DATABASE_URL` GitHub Secret.

## Notes

- Always commit `prisma/migrations/**/migration.sql` files.
- Use `prisma migrate dev` locally to create new migrations as your schema evolves.