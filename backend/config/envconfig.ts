import { AppError } from '../types/express-error';
import type { EnvSchemaType } from '../types/types';
import { envSchema } from './env.validation';

// ✅ Validate and type the result
const { error, value } = envSchema.validate(process.env, {
  abortEarly: true,
  allowUnknown: true,
  stripUnknown: false,
}) as {
  error?: Error;
  value: EnvSchemaType;
};

if (error) {
  const err = new AppError(
    'On Env',
    `⚠️ Environment variable validation error:\n${error.message}`,
    500,
    'envconfig',
    'fatal'
  );
  console.log(err);
  throw err;
}

// ✅ Now no unsafe access
const env = {
  port: value.PORT,
  pro_env: value.PROJECT_ENV,
  app_base_path: value.API_BASE_PATH,
  db_user: value.USER,
  db_pass: value.PASS,
  db_max_pool: value.MAXPOOLSIZE,
  db_min_pool: value.MINPOOLSIZE,
  db_url: value.DB_URL,
  db_name: value.DB_NAME,
  log_level: value.LOG_LEVEL,
  JWTKEY: value.JWTKEY,
  loginDashboardUrl: value.loginDashboardUrl,
  defaultEmail: value.defaultEmail,
  email_pass: value.email_pass
};

export { env };
