export function getOpensClicksByDate(_: string, days = 14): Array<{ date: string; opens: number; clicks: number }> {
  const base = new Date();
  const out: Array<{ date: string; opens: number; clicks: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    out.push({ date: k, opens: 0, clicks: 0 });
  }
  return out;
}

export function setOpensClicks(_: string, __: string, ___: { opens?: number; clicks?: number }) {
  // no-op; server-side tracking only
}


