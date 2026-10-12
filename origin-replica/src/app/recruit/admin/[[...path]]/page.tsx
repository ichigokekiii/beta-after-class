const OMEGA_ADMIN = "https://afterclass-website-omega.vercel.app/recruit/admin";

const iframeStyle = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  border: "none",
} as const;

function queryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) {
      for (const item of value) qs.append(key, item);
    }
  }
  const encoded = qs.toString();
  return encoded ? `?${encoded}` : "";
}

export default async function RecruitAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { path } = await params;
  const query = await searchParams;
  const suffix = path?.length ? `/${path.join("/")}` : "";
  return (
    <iframe
      src={`${OMEGA_ADMIN}${suffix}${queryString(query)}`}
      title="Recruit admin"
      style={iframeStyle}
    />
  );
}
