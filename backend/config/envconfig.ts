const env = {
  port:process.env.PORT,
  pro_env:process.env.PROJECT_ENV,
  app_base_path:process.env.API_BASE_PATH,
  db_user:process.env.USER,
  db_pass:process.env.PASS,
  db_max_pool:process.env.MAXPOOLSIZE,
  db_min_pool:process.env.MINPOOLSIZE,
  db_url:process.env.DB_URL!,
  db_name:process.env.DB_NAME!,
  log_level:process.env.LOG_LEVEL
}

export {
    env
}