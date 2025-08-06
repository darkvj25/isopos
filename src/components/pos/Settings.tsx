import { useState } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Store, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Settings = () => {
  const { settings, updateSettings } = usePosData();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast({
      title: "Settings Updated",
      description: "Business settings have been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Configure your business information</p>
      </div>

      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tin">TIN</Label>
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(e) => setFormData({...formData, tin: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="birPermitNumber">BIR Permit Number</Label>
                <Input
                  id="birPermitNumber"
                  value={formData.birPermitNumber}
                  onChange={(e) => setFormData({...formData, birPermitNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Textarea
                id="receiptFooter"
                value={formData.receiptFooter}
                onChange={(e) => setFormData({...formData, receiptFooter: e.target.value})}
                placeholder="Thank you message for receipts"
              />
            </div>

            <Button type="submit" className="pos-button-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};