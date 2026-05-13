import type { AdminDashboardPayload } from "@/lib/server/admin-dashboard";
import {
  eventNameDisplay,
  FUNNEL_STEP_HINT,
  shareSourceDisplay,
} from "@/lib/server/admin-labels";

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number | string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-6">
      <p className="text-[13px] font-semibold leading-snug text-slate-800">{title}</p>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-[2rem]">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

function RankTable({
  title,
  description,
  rows,
  leftHead,
  valueHead,
}: {
  title: string;
  description?: string;
  rows: { label: string; count: number }[];
  leftHead: string;
  valueHead: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{description}</p>
      ) : null}
      <p className="mt-1 text-[12px] text-slate-400">按次数降序，最多 40 条</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[260px] text-left text-[13px]">
          <thead className="bg-slate-50 text-[12px] font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-2.5">{leftHead}</th>
              <th className="px-3 py-2.5 text-right tabular-nums">{valueHead}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.label}-${i}`}
                  className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60"
                >
                  <td className="max-w-[220px] truncate px-3 py-2.5 font-medium text-slate-800 sm:max-w-none">
                    {row.label}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                    {row.count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReferralInviteTable({
  rows,
}: {
  rows: { nickname: string; share_code: string; invite_count: number }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">邀请排行榜</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
        每位用户通过邀请链接带来的「新注册」人数，按人数从高到低排序。
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[320px] text-left text-[13px]">
          <thead className="bg-slate-50 text-[12px] font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-2.5">用户昵称</th>
              <th className="px-3 py-2.5">分享码</th>
              <th className="px-3 py-2.5 text-right tabular-nums">带来新用户</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  暂无拉新数据
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.share_code}-${i}`}
                  className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60"
                >
                  <td className="max-w-[140px] truncate px-3 py-2.5 font-medium text-slate-800 sm:max-w-none">
                    {row.nickname || "—"}
                  </td>
                  <td className="max-w-[120px] truncate px-3 py-2.5 font-mono text-[12px] text-slate-700 sm:max-w-none">
                    {row.share_code}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                    {row.invite_count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReferralShareOpensTable({
  rows,
}: {
  rows: { share_code: string; nickname: string | null; opens: number }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">分享曝光排行</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
        统计带推荐分享码打开页面的次数（多为朋友点开你的分享链接），用于看谁的内容更易被点开。
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[300px] text-left text-[13px]">
          <thead className="bg-slate-50 text-[12px] font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-2.5">分享码</th>
              <th className="px-3 py-2.5">对应用户</th>
              <th className="px-3 py-2.5 text-right tabular-nums">打开次数</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.share_code}-${i}`}
                  className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60"
                >
                  <td className="max-w-[120px] truncate px-3 py-2.5 font-mono text-[12px] font-medium text-slate-800 sm:max-w-none">
                    {row.share_code}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2.5 text-slate-700 sm:max-w-none">
                    {row.nickname ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                    {row.opens}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShareSourceCountMini({
  title,
  sub,
  rows,
}: {
  title: string;
  sub: string;
  rows: { source: string; count: number }[];
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-[13px] font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{sub}</p>
      <ul className="mt-3 space-y-2">
        {rows.length === 0 ? (
          <li className="py-3 text-center text-[12px] text-slate-500">暂无</li>
        ) : (
          rows.map((r) => (
            <li
              key={r.source}
              className="flex items-center justify-between gap-2 text-[13px]"
            >
              <span className="font-medium text-slate-800">
                {shareSourceDisplay(r.source)}
              </span>
              <span className="tabular-nums font-semibold text-slate-900">
                {r.count}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ShareViralSection({
  landing,
  outbound,
  conversion,
}: {
  landing: { source: string; count: number }[];
  outbound: { source: string; count: number }[];
  conversion: {
    source: string;
    opens: number;
    signups: number;
    ratePercent: number | null;
  }[];
}) {
  const best = conversion.reduce(
    (acc, row) => {
      if (row.ratePercent == null) return acc;
      if (acc == null) return row;
      const ar = acc.ratePercent ?? -1;
      if (row.ratePercent > ar) return row;
      return acc;
    },
    null as (typeof conversion)[number] | null,
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">分享渠道效果</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
        落地：用户从带渠道参数的分享链接进入投票页；出站：在结果页点了 Zalo、Facebook
        或复制链接。转化率 = 该渠道带来的新注册 ÷ 该渠道落地打开次数。
      </p>
      {best && best.ratePercent != null ? (
        <p className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-[12px] text-emerald-950">
          当前转化率最高渠道：
          <span className="font-semibold">
            {shareSourceDisplay(best.source)}
          </span>
          {" · "}
          <span className="tabular-nums font-semibold">{best.ratePercent}%</span>
          （注册 {best.signups} / 打开 {best.opens}）
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ShareSourceCountMini
          title="落地打开（按渠道）"
          sub="用户从分享链接点进来，链接上带有来源标记（如 Zalo、复制链接）。"
          rows={landing}
        />
        <ShareSourceCountMini
          title="出站分享（按渠道）"
          sub="用户在结果页主动分享时选择的渠道。"
          rows={outbound}
        />
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[300px] text-left text-[13px]">
          <thead className="bg-slate-50 text-[12px] font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-2.5">渠道</th>
              <th className="px-3 py-2.5 text-right tabular-nums">落地打开</th>
              <th className="px-3 py-2.5 text-right tabular-nums">新注册</th>
              <th className="px-3 py-2.5 text-right tabular-nums">转化率</th>
            </tr>
          </thead>
          <tbody>
            {conversion.map((row) => (
              <tr
                key={row.source}
                className={`border-t border-slate-100 odd:bg-white even:bg-slate-50/60 ${
                  best?.source === row.source ? "bg-emerald-50/60" : ""
                }`}
              >
                <td className="px-3 py-2.5 font-medium text-slate-800">
                  {shareSourceDisplay(row.source)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                  {row.opens}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                  {row.signups}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                  {row.ratePercent != null ? `${row.ratePercent}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminDashboardView({ data }: { data: AdminDashboardPayload }) {
  return (
    <>
      {data.ok === false && data.reason === "no_service_key" ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-[14px] leading-relaxed text-amber-950 sm:p-6">
          <p className="text-lg font-semibold text-amber-950">
            需要配置 Service Role
          </p>
          <p className="mt-3 text-[13px] text-amber-900/95">
            看板需要读取全表做统计（投票、行为事件等）。匿名密钥受行级权限限制，无法可靠统计。请在
            <strong>仅服务端使用</strong>的环境变量{" "}
            <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-[12px]">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            中填入本项目的 <strong>service_role</strong> 密钥（不要加{" "}
            <code className="font-mono text-[12px]">NEXT_PUBLIC_</code>{" "}
            前缀，不要提交到 Git）。
          </p>

          <p className="mt-5 text-[13px] font-semibold text-amber-950">
            获取密钥（Supabase 控制台）
          </p>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-[13px] text-amber-900/95">
            <li>
              打开{" "}
              <a
                className="font-medium text-amber-800 underline decoration-amber-600/60 underline-offset-2 hover:text-amber-950"
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
              >
                Supabase Dashboard
              </a>
              ，进入与{" "}
              <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              对应的项目。
            </li>
            <li>
              左侧 <strong>Project Settings</strong>（齿轮）→{" "}
              <strong>Data API</strong> 或 <strong>API</strong> → 复制{" "}
              <strong>service_role</strong>（Secret）。
            </li>
            <li>
              <strong>本地：</strong>在项目根目录{" "}
              <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
                .env.local
              </code>{" "}
              增加一行{" "}
              <code className="mt-1 block break-all rounded bg-amber-100/70 px-2 py-1.5 font-mono text-[11px] text-amber-950 sm:text-[12px]">
                SUPABASE_SERVICE_ROLE_KEY=粘贴的密钥
              </code>
            </li>
            <li>
              <strong>线上：</strong>在部署平台环境变量中配置同名变量，保存后重新部署。
            </li>
            <li>
              重启本地开发服务或等待部署完成后<strong>刷新本页</strong>。
            </li>
          </ol>

          <p className="mt-5 rounded-lg border border-amber-300/60 bg-amber-100/40 px-3 py-2.5 text-[12px] text-amber-950">
            <strong>安全提示：</strong>
            service_role 可绕过数据权限，等同于数据库管理员权限；仅放在服务端，勿暴露给浏览器或公开仓库。
          </p>
          <p className="mt-2 text-[12px] text-amber-800/90">
            文档：{" "}
            <a
              className="font-medium underline decoration-amber-600/50 underline-offset-2 hover:text-amber-950"
              href="https://supabase.com/docs/guides/api/api-keys"
              target="_blank"
              rel="noreferrer"
            >
              API Keys（anon / service_role）
            </a>
          </p>
        </div>
      ) : null}

      {data.ok === false && data.reason === "error" ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-[14px] text-red-950">
          <p className="font-semibold">加载失败</p>
          <p className="mt-2 break-all font-mono text-[12px]">{data.message}</p>
        </div>
      ) : null}

      {data.ok ? (
        <>
          <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-4">
            <StatCard
              title="创建用户总数"
              value={data.totals.profiles}
              description="有多少人创建了自己的人设页（累计）。"
            />
            <StatCard
              title="总投票数"
              value={data.totals.votes}
              description="朋友一共为你提交了多少次评价（累计）。"
            />
            <StatCard
              title="行为事件总数"
              value={data.totals.events}
              description="客户端上报的埋点总条数，用于观察各环节活跃情况。"
            />
            <StatCard
              title="今日新增用户"
              value={data.today.profiles}
              description="以上海时区「今天 0 点起」新创建的人设数量。"
            />
            <StatCard
              title="今日新增投票"
              value={data.today.votes}
              description="以上海时区「今天 0 点起」新提交的投票次数。"
            />
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/90 p-5 ring-1 ring-slate-900/[0.02]">
              <p className="text-[12px] font-semibold text-slate-700">数据说明</p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                排行榜为分页拉取样本；数据量极大时加载可能变慢，后续可改为数据库侧聚合。
              </p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-lg font-semibold text-slate-900">用户转化漏斗</h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
              用来观察用户是否愿意<strong>分享</strong>、是否愿意<strong>邀请朋友</strong>
              来参与的核心路径。条越长，说明该步骤累计发生次数越多（全时段）。
            </p>
            <div className="mt-5 space-y-4">
              {(() => {
                const max = Math.max(1, ...data.funnel.map((f) => f.count));
                return data.funnel.map((row) => (
                  <div key={row.step}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13px]">
                      <span className="font-semibold text-slate-800">
                        {eventNameDisplay(row.step)}
                      </span>
                      <span className="shrink-0 tabular-nums text-[15px] font-bold text-slate-900">
                        {row.count}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {FUNNEL_STEP_HINT[row.step]}
                    </p>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200/90">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-[width]"
                        style={{
                          width: `${Math.round((row.count / max) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <ReferralInviteTable rows={data.referralInviteLeaderboard} />
            <ReferralShareOpensTable rows={data.referralShareOpens} />
          </section>

          <section className="mt-12">
            <ShareViralSection
              landing={data.shareLandingBySource}
              outbound={data.shareOutboundBySource}
              conversion={data.shareSourceConversion}
            />
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <RankTable
              title="标签得票排行"
              description="朋友给你选得最多的标签，反映大家对你的印象。"
              rows={data.tagLeaderboard.map((r) => ({
                label: r.tag,
                count: r.count,
              }))}
              leftHead="标签"
              valueHead="得票数"
            />
            <RankTable
              title="行为事件排行"
              description="各埋点事件累计触发次数；名称已转为中文，未映射的仍显示原始值。"
              rows={data.eventLeaderboard.map((r) => ({
                label: eventNameDisplay(r.event_name),
                count: r.count,
              }))}
              leftHead="事件"
              valueHead="次数"
            />
          </section>
        </>
      ) : null}

      <footer className="mt-14 border-t border-slate-200/90 pt-6 text-center text-[11px] text-slate-500">
        内部数据看板 · 请勿外传
      </footer>
    </>
  );
}
