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

type SequelizeUpdateResult<T> = [affectedCount: number, affectedRows: T[]];

export type { DatabaseOptions, SequelizeUpdateResult };
