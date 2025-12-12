import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { User, Database, Bell, Palette, Shield, Save } from 'lucide-react';

const Settings = () => {
  const { role, setRole } = useRole();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure application preferences and defaults</p>
      </div>

      {/* User & Role Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            User & Role Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input defaultValue="Research Analyst" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="analyst@research.org" type="email" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Current Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analyst">Analyst (Full Access)</SelectItem>
                <SelectItem value="actuary">Actuary / Pricing (Includes Simulator)</SelectItem>
                <SelectItem value="executive">Executive Viewer (Read-Only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Role determines navigation visibility and feature access.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data & Model Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data & Model Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Model</Label>
              <Select defaultValue="minimal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal Structure (Research)</SelectItem>
                  <SelectItem value="logistic">Logistic Regression / GLM</SelectItem>
                  <SelectItem value="gbm">Gradient Boosting</SelectItem>
                  <SelectItem value="rf">Random Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Feature Set</Label>
              <Select defaultValue="reduced">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduced">Reduced Behavior-First (8)</SelectItem>
                  <SelectItem value="behavior_clinical">Behavior + Clinical (12)</SelectItem>
                  <SelectItem value="full">Full Feature Set (47)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catastrophic Threshold ($)</Label>
            <Input type="number" defaultValue="20000" className="w-full md:w-[200px]" />
            <p className="text-xs text-muted-foreground">
              Default threshold for catastrophic spending classification.
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable Bootstrap Uncertainty</p>
              <p className="text-xs text-muted-foreground">Calculate confidence intervals by default</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Auto-Save Runs</p>
              <p className="text-xs text-muted-foreground">Automatically save scoring results to history</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Scoring Complete</p>
              <p className="text-xs text-muted-foreground">Notify when model scoring finishes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Data Quality Warnings</p>
              <p className="text-xs text-muted-foreground">Alert on validation issues during upload</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Fairness Alerts</p>
              <p className="text-xs text-muted-foreground">Notify on disparate impact threshold violations</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Display Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chart Color Scheme</Label>
            <Select defaultValue="default">
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Risk-Based)</SelectItem>
                <SelectItem value="sequential">Sequential Blues</SelectItem>
                <SelectItem value="diverging">Diverging</SelectItem>
                <SelectItem value="categorical">Categorical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Show Data Dictionary Tooltips</p>
              <p className="text-xs text-muted-foreground">Display variable descriptions on hover</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Compact Tables</p>
              <p className="text-xs text-muted-foreground">Reduce table row height for denser views</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* API & Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API & Integration
          </CardTitle>
          <CardDescription>Backend connection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Endpoint</Label>
            <div className="flex gap-2">
              <Input defaultValue="http://localhost:8000/api/v1" className="flex-1" />
              <Badge variant="outline" className="h-10 px-3 flex items-center bg-risk-low/10 text-risk-low">
                Connected
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <Input type="password" defaultValue="sk_live_xxxxxxxxxxxx" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable Request Logging</p>
              <p className="text-xs text-muted-foreground">Log API calls for debugging</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
