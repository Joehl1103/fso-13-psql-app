interface SslOptions {
  require: boolean;
  ca: string;
}

interface DialectOptions {
  ssl: SslOptions;
}

export interface DatabaseOptions {
  dialect: string;
  logging: boolean;
  dialectOptions: DialectOptions | {};
}
