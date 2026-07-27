const { Pool } = require("pg");

const buildConnectionString = () => {
  if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
    return process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  }

  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    const port = process.env.DB_PORT || 5432;
    const encodedUser = encodeURIComponent(process.env.DB_USER);
    const encodedPassword = encodeURIComponent(process.env.DB_PASSWORD);
    return `postgresql://${encodedUser}:${encodedPassword}@${process.env.DB_HOST}:${port}/${process.env.DB_NAME}`;
  }

  return "postgresql://postgres:postgres@localhost:5432/academix";
};

const pgPool = new Pool({
  connectionString: buildConnectionString(),
  ssl:
    process.env.DB_SSL === "true" || process.env.SUPABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

const escapeIdentifier = (value) => {
  return `"${String(value).replace(/"/g, '""')}"`;
};

const normalizeQuery = (sql, params = []) => {
  let index = 0;
  const text = String(sql).replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });

  return {
    text,
    values: Array.isArray(params) ? params : [params],
  };
};

const normalizeResult = async (client, sql, result) => {
  if (Array.isArray(result?.rows)) {
    const rows = result.rows;

    if (/^select\s+/i.test(String(sql).trim())) {
      return rows;
    }

    const payload = {
      rowCount: result?.rowCount ?? rows.length,
      affectedRows: result?.rowCount ?? rows.length,
      insertId: null,
      rows,
      fields: result?.fields ?? [],
    };

    if (/^insert\s+/i.test(String(sql).trim())) {
      try {
        const tableMatch = String(sql).match(/insert\s+into\s+([a-zA-Z0-9_.-]+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1].replace(/^public\./i, "");
          const sequenceQuery = `SELECT currval(pg_get_serial_sequence(${escapeIdentifier(tableName)}, 'id')) AS id`;
          const response = await client.query(sequenceQuery);
          if (response?.rows?.[0]?.id !== null && response?.rows?.[0]?.id !== undefined) {
            payload.insertId = Number(response.rows[0].id);
          }
        }
      } catch (error) {
        // Ignore insert id detection errors and fall back to null.
      }
    }

    return payload;
  }

  return result;
};

const createConnection = (client) => ({
  query: async (sql, params) => {
    const { text, values } = normalizeQuery(sql, params);
    const result = await client.query(text, values);
    return [await normalizeResult(client, sql, result)];
  },
  beginTransaction: async () => {
    await client.query("BEGIN");
  },
  commit: async () => {
    await client.query("COMMIT");
  },
  rollback: async () => {
    await client.query("ROLLBACK");
  },
  release: () => client.release(),
});

const pool = {
  query: async (sql, params) => {
    const { text, values } = normalizeQuery(sql, params);
    const result = await pgPool.query(text, values);
    return [await normalizeResult(pgPool, sql, result)];
  },
  getConnection: async () => {
    const client = await pgPool.connect();
    return createConnection(client);
  },
};

const testConnection = async () => {
  try {
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Supabase/Postgres Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

module.exports = {
  pool,
  testConnection,
};
