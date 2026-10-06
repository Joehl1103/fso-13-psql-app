interface SslOptions {
  require: boolean;
  ca: string;
}

interface DialectOptions {
  ssl: SslOptions;
}

interface DatabaseOptions {
  dialect: string;
  logging: boolean;
  dialectOptions: DialectOptions | {};
}

export type { DatabaseOptions };
