import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Store, MapPin, Phone, Mail, Clock, Share2, Save } from 'lucide-react';

interface CafeSetting {
  id: string;
  key: string;
  value: string | null;
  type: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['cafeSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cafe_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as CafeSetting[];
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const promises = updates.map(({ key, value }) =>
        supabase
          .from('cafe_settings')
          .update({ value })
          .eq('key', key)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update some settings');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafeSettings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSettingValue = (key: string): string => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  const [formData, setFormData] = useState<Record<string, string>>({});

  // Initialize form data when settings load
  React.useEffect(() => {
    if (settings.length > 0) {
      const initialData: Record<string, string> = {};
      settings.forEach(setting => {
        initialData[setting.key] = setting.value || '';
      });
      setFormData(initialData);
    }
  }, [settings]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = (keys: string[]) => {
    const updates = keys.map(key => ({
      key,
      value: formData[key] || ''
    }));
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-coffee-medium animate-pulse" />
            <h1 className="text-3xl font-bold text-coffee-dark">Settings</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-48"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-coffee-medium" />
          <h1 className="text-3xl font-bold text-coffee-dark">Settings</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-coffee-light/20 shadow-warm">
              <CardHeader>
                <CardTitle className="text-coffee-dark flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_name">Cafe Name</Label>
                  <Input
                    id="cafe_name"
                    value={formData.cafe_name || ''}
                    onChange={(e) => handleInputChange('cafe_name', e.target.value)}
                    placeholder="Enter cafe name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cafe_description">Description</Label>
                  <Textarea
                    id="cafe_description"
                    value={formData.cafe_description || ''}
                    onChange={(e) => handleInputChange('cafe_description', e.target.value)}
                    placeholder="Enter cafe description"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="coffee" 
                    onClick={() => handleSaveSection(['cafe_name', 'cafe_description'])}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save General Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card className="border-coffee-light/20 shadow-warm">
              <CardHeader>
                <CardTitle className="text-coffee-dark flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input
                    id="address_line1"
                    value={formData.address_line1 || ''}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    placeholder="Street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line2">Address Line 2</Label>
                  <Input
                    id="address_line2"
                    value={formData.address_line2 || ''}
                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    placeholder="District, Area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_state_zip">City, State ZIP</Label>
                  <Input
                    id="city_state_zip"
                    value={formData.city_state_zip || ''}
                    onChange={(e) => handleInputChange('city_state_zip', e.target.value)}
                    placeholder="City, State 12345"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="coffee" 
                    onClick={() => handleSaveSection(['address_line1', 'address_line2', 'city_state_zip'])}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card className="border-coffee-light/20 shadow-warm">
              <CardHeader>
                <CardTitle className="text-coffee-dark flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-CAFE"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="hello@logincafe.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social_handle">Social Media Handle</Label>
                  <Input
                    id="social_handle"
                    value={formData.social_handle || ''}
                    onChange={(e) => handleInputChange('social_handle', e.target.value)}
                    placeholder="@LoginCafe"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="coffee" 
                    onClick={() => handleSaveSection(['phone', 'email', 'social_handle'])}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Contact Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <Card className="border-coffee-light/20 shadow-warm">
              <CardHeader>
                <CardTitle className="text-coffee-dark flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hours_weekday">Weekday Hours</Label>
                  <Input
                    id="hours_weekday"
                    value={formData.hours_weekday || ''}
                    onChange={(e) => handleInputChange('hours_weekday', e.target.value)}
                    placeholder="Mon-Fri: 6:00 AM - 8:00 PM"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours_weekend">Weekend Hours</Label>
                  <Input
                    id="hours_weekend"
                    value={formData.hours_weekend || ''}
                    onChange={(e) => handleInputChange('hours_weekend', e.target.value)}
                    placeholder="Sat-Sun: 7:00 AM - 9:00 PM"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="coffee" 
                    onClick={() => handleSaveSection(['hours_weekday', 'hours_weekend'])}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Hours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;