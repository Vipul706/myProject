import Joi from 'joi';

// Step 1: Define the validation schema
const envSchema = Joi.object({
  PORT: Joi.number().required(),
  PROJECT_ENV: Joi.string().valid('development', 'production', 'local').required(),
  API_BASE_PATH: Joi.string().required(),
  USER: Joi.string().required(),
  PASS: Joi.string().required(),
  MAXPOOLSIZE: Joi.number().required(),
  MINPOOLSIZE: Joi.number().required(),
  DB_URL: Joi.string().uri().required(),
  DB_NAME: Joi.string().required(),
  JWTKEY: Joi.string().required(),
  LOG_LEVEL: Joi.string().valid( 'fatal' , 'error' , 'warn' , 'info' , 'debug' , 'trace').required(),
  loginDashboardUrl:Joi.string().required()
}).unknown(); // allow other env vars to pass through

export {
    envSchema
}