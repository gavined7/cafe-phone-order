import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Phone, Calendar, Edit } from 'lucide-react';

interface User {
  id: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: {
    role: string;
  }[];
}

const AdminUsers = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First, remove existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add new role if not 'user' (default)
      if (role !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsRoleDialogOpen(false);
      toast({
        title: "Success",
        description: "User role updated successfully.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUserRole = (user: User): string => {
    if (user.user_roles && user.user_roles.length > 0) {
      // Return the highest role (admin > moderator > user)
      const roles = user.user_roles.map(r => r.role);
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('moderator')) return 'moderator';
    }
    return 'user';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateRole = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const getRoleOptions = () => [
    { value: 'user', label: 'User' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Admin' },
  ];

  const getFullName = (user: User) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Unnamed User';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-coffee-medium" />
            <h1 className="text-3xl font-bold text-coffee-dark">Users</h1>
          </div>
          <Badge variant="secondary" className="bg-coffee-light text-coffee-dark">
            {users.length} Total Users
          </Badge>
        </div>

        <Card className="border-coffee-light/20 shadow-warm">
          <CardHeader>
            <CardTitle className="text-coffee-dark">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const role = getUserRole(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {getFullName(user)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-coffee-medium" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No phone</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-coffee-medium" />
                            <Badge className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-coffee-medium" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog open={isRoleDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsRoleDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Role
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update User Role</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-medium">{getFullName(selectedUser)}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Current Role: <span className="font-medium">{getUserRole(selectedUser)}</span>
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Select New Role</label>
                                    <Select
                                      defaultValue={getUserRole(selectedUser)}
                                      onValueChange={(value) => handleUpdateRole(selectedUser.id, value)}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white z-50">
                                        {getRoleOptions().map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center space-x-2">
                                              <Shield className="h-4 w-4" />
                                              <span>{option.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>User:</strong> Can place orders and view their own data</p>
                                    <p><strong>Moderator:</strong> Can manage products and categories</p>
                                    <p><strong>Admin:</strong> Full access to all admin features</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;