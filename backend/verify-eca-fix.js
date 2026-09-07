const { pool } = require("./config/db");

const queries = [
  ["admin status SELECT",   "SELECT id, status FROM eca_certificate_requests WHERE id = ? LIMIT 1", [1]],
  ["admin status UPDATE",   "UPDATE eca_certificate_requests SET status = ? WHERE id = ?", ["pending", -1]],
  ["admin generate UPDATE", "UPDATE eca_certificate_requests SET status = 'generated', certificate_id = ? WHERE id = ?", ["ECA-TEST", -1]],
  ["admin delete DELETE",   "DELETE FROM eca_certificate_requests WHERE id = ?", [-1]],
];

(async () => {
  let failed = 0;
  for (const [name, sql, params] of queries) {
    try {
      await pool.query(sql, params);
      console.log(`PASS  ${name}`);
    } catch (e) {
      failed++;
      console.error(`FAIL  ${name} -> ${e.code || e.message}`);
    }
  }
  await pool.end();
  console.log(failed ? `\n${failed} still broken` : "\nAll repaired queries execute cleanly.");
  process.exit(failed ? 1 : 0);
})();
