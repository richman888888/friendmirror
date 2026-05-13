/**
 * 在远程 Supabase Postgres 上执行增量迁移（按文件名顺序）。
 *
 * 凭据（二选一）写入项目根目录 `.env.local`：
 * 1) DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres
 * 2) SUPABASE_DB_PASSWORD=<数据库密码> + 已有的 NEXT_PUBLIC_SUPABASE_URL
 *
 * 数据库密码：Dashboard → Project Settings → Database → Database password（非 anon / service_role）。
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) {
    console.error("未找到 .env.local");
    process.exit(1);
  }
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function resolveDatabaseUrl(env) {
  if (env.DATABASE_URL && env.DATABASE_URL.startsWith("postgres")) {
    return env.DATABASE_URL;
  }
  const pw = env.SUPABASE_DB_PASSWORD;
  const pub = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!pw || !pub) return null;
  const m = String(pub)
    .trim()
    .match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  if (!m) return null;
  const ref = m[1];
  const enc = encodeURIComponent(pw);
  return `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`;
}

const MIGRATION_FILES = [
  "20260516100000_referral_system.sql",
  "20260517120000_viral_share_tracking.sql",
];

async function main() {
  const env = loadEnvLocal();
  const databaseUrl = resolveDatabaseUrl(env);
  if (!databaseUrl) {
    console.error(`
无法连接数据库：请在 .env.local 中配置其一：

  DATABASE_URL=postgresql://postgres:<密码>@db.<项目ref>.supabase.co:5432/postgres

或：

  SUPABASE_DB_PASSWORD=<数据库密码>
  （并保留已有的 NEXT_PUBLIC_SUPABASE_URL）

密码位置：Supabase Dashboard → Project Settings → Database → Database password
`);
    process.exit(1);
  }

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const file of MIGRATION_FILES) {
      const fp = path.join(migrationsDir, file);
      if (!fs.existsSync(fp)) {
        console.error("缺少迁移文件:", fp);
        process.exit(1);
      }
      const sql = fs.readFileSync(fp, "utf8");
      console.log("→ 执行", file);
      await client.query(sql);
    }
    console.log("✓ 迁移已全部执行（含 NOTIFY pgrst）。");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
