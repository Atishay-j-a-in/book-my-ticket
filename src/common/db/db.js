import pg from "pg";
const pool = new pg.Pool({
  host: `${process.env.POSTGRES_HOST}`,
  port:`${process.env.POSTGRE_PORT}` || 5432,
  user: `${process.env.POSTGRE_USERNAME}`,
  password: `${process.env.POSTGRE_PASS}`,
  database: `${process.env.POSTGRE_DB}`,
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

export default pool