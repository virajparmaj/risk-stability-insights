export function buildSegmentationMatrix(rows: any[]) {
  return rows.map(r => ([
    r.low_risk_probability,
    Math.log1p(r.tot_cost),
    Object.values(r.features)
      .filter(v => v === 1).length
  ]));
}