# fso-13-psql-app

This Express and PostgreSQL application uses native ES modules. Local imports include the `.js` file extension, and modules expose values with `export` rather than CommonJS `module.exports`.

## Testing

- native tests run with `npm run test`. They have their own test database container.
- fso tests run with the aiven database after starting with `npm run start`.
