# fso-13-psql-app

Express and PostgreSQL blog API for Full Stack Open part 13. The app uses native ES modules. Local imports include the `.js` file extension, and modules expose values with `export`.

## Setup

```bash
npm install
cp .env.example .env
```

Set these in `.env`:

- `DATABASE_URL` — Postgres connection string for the app database
- `DATABASE_SSL` — `true` when that host requires TLS
- `SECRET` — JWT signing secret

The server listens on `PORT`, or on 3001 when `PORT` is unset.

```bash
npm run migrate:up
npm start
```

`npm start` loads `.env`, connects with `DATABASE_URL`, and syncs the Sequelize models.

## Databases

| Command | Config source | Connection variable |
| --- | --- | --- |
| `npm start` | `.env` | `DATABASE_URL` |
| `npm test` | `.env.test` (`NODE_ENV=test`) | `DATABASE_URL` |
| `npm run course:start:test` | the process environment (`CI_TESTING=true`) | `TESTING_DATABASE_URL` |

Vitest refuses to run unless `NODE_ENV` is `test` and the database name ends with `test`. `.env.test` points at the local `app_test` database. `docker-compose.test.yaml` defines that database.

`docker-compose.ci.yaml` defines the `test_db` database used by the course workflow.

## Testing

Local Vitest suite, against the database in `.env.test`:

```bash
npm test
```

Course API tests call a server that is already listening on port 3001. Start it in CI mode, then run the tests. `course:start:test` sets `CI_TESTING=true`. `TESTING_DATABASE_URL`, `PORT`, and `SECRET` still have to be in the environment:

```bash
TESTING_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db?sslmode=disable \
PORT=3001 \
SECRET=test_secret \
npm run course:start:test
```

```bash
npm run course:test
```

`course:test` runs `testing/course-ci-tests/api_ch3.test.js` and `api_ch4.test.js` with Node's test runner. Those tests call `http://localhost:3001/api` and clear tables through `POST /api/reset`.

GitHub Actions (`.github/workflows/test.yml`) runs this on pushes and pull requests to `master`. The job starts Postgres 17 with database `test_db`, starts the app with `course:start:test`, then runs `course:test`.

## Migrations

```bash
npm run migrate:up
npm run migrate:down
npm run test:migrate:up
npm run test:migrate:down
```

`test:migrate:up` and `test:migrate:down` set `NODE_ENV=test`, so they use `.env.test`.
