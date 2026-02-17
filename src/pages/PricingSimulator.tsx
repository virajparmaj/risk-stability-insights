import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";

const PricingSimulator = () => {
  const { currentRun } = useData();
  const [basePremium, setBasePremium] = useState(450);
  const [adminLoad, setAdminLoad] = useState([12]);
  const [riskMargin, setRiskMargin] = useState([8]);
  const lowRiskRate = currentRun?.summary.low_risk_rate ?? 0;
  const memberCount = currentRun?.summary.n_members ?? 0;

  const scenarioRows = useMemo(() => {
    const lowRiskDiscount = lowRiskRate * 0.25;
    const baseLossRatio = 95 - lowRiskRate * 40;

    const scenarios = [
      {
        scenario: "Baseline",
        premium: basePremium,
        lossRatio: baseLossRatio,
      },
      {
        scenario: "Retention Focus",
        premium: basePremium * (1 - lowRiskDiscount),
        lossRatio: baseLossRatio + 4,
      },
      {
        scenario: "Margin Focus",
        premium: basePremium * 1.08,
        lossRatio: baseLossRatio - 5,
      },
    ];

    return scenarios.map((scenario) => {
      const revenuePMPM = scenario.premium;
      const claimsPMPM = (scenario.lossRatio / 100) * revenuePMPM;
      const expensePMPM = (adminLoad[0] / 100) * revenuePMPM;
      const riskPMPM = (riskMargin[0] / 100) * revenuePMPM;
      const profitPMPM = revenuePMPM - claimsPMPM - expensePMPM - riskPMPM;

      return {
        ...scenario,
        revenuePMPM,
        claimsPMPM,
        expensePMPM,
        riskPMPM,
        profitPMPM,
        annualProfit: profitPMPM * memberCount * 12,
      };
    });
  }, [adminLoad, basePremium, lowRiskRate, memberCount, riskMargin]);

  const projection = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => ({
        month: month + 1,
        baseline: scenarioRows[0].annualProfit * ((month + 1) / 12),
        retention: scenarioRows[1].annualProfit * ((month + 1) / 12),
        margin: scenarioRows[2].annualProfit * ((month + 1) / 12),
      })),
    [scenarioRows]
  );

  if (!currentRun) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        No scored dataset available.
        <br />
        Upload and validate MEPS data first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Pricing & Retention Simulator
          </h1>
          <p className="text-muted-foreground mt-1">
            Scenario estimates based on current run low-risk mix
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportToCSV(
              scenarioRows.map((row) => ({
                scenario: row.scenario,
                premium_pmpm: Number(row.premium.toFixed(2)),
                loss_ratio: Number(row.lossRatio.toFixed(2)),
                revenue_pmpm: Number(row.revenuePMPM.toFixed(2)),
                claims_pmpm: Number(row.claimsPMPM.toFixed(2)),
                expense_pmpm: Number(row.expensePMPM.toFixed(2)),
                risk_margin_pmpm: Number(row.riskPMPM.toFixed(2)),
                profit_pmpm: Number(row.profitPMPM.toFixed(2)),
                annual_profit: Number(row.annualProfit.toFixed(2)),
              })),
              `${currentRun.datasetName}_pricing_scenarios.csv`
            )
          }
        >
          <Download className="h-4 w-4" />
          Export Scenarios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>
              Updated instantly against current run composition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Base Premium (PMPM)</Label>
              <Input
                type="number"
                value={basePremium}
                onChange={(event) => setBasePremium(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Admin Load</Label>
                <span className="text-sm">{adminLoad[0]}%</span>
              </div>
              <Slider
                value={adminLoad}
                onValueChange={setAdminLoad}
                min={5}
                max={25}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Risk Margin</Label>
                <span className="text-sm">{riskMargin[0]}%</span>
              </div>
              <Slider
                value={riskMargin}
                onValueChange={setRiskMargin}
                min={3}
                max={20}
                step={1}
              />
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground">Current run low-risk rate</p>
              <p className="font-semibold mt-1">{(lowRiskRate * 100).toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Scenario Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioRows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, "Annual Profit"]} />
                  <Bar dataKey="annualProfit" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">12-Month Cumulative Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, "Cumulative Profit"]} />
                <Area type="monotone" dataKey="baseline" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} />
                <Area type="monotone" dataKey="retention" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                <Area type="monotone" dataKey="margin" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingSimulator;
