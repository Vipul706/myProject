
import { AppError } from '../types/express-error';
import { envSchema } from './env.validation';

// Step 2: Validate process.env 
const { error, value } = envSchema.validate(process.env, {
  abortEarly: true, // show all errors at once
  allowUnknown: true,
  stripUnknown: false,
});

// Step 3: If validation fails, throw AppError
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

// Step 4: Safely extract env values
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
  loginDashboardUrl: value.loginDashboardUrl
};

export { env };
