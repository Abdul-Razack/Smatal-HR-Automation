'use client';

import * as React from 'react';
import { useUser } from '../hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UserProfile() {
  const { useMe } = useUser();
  const { data: user, isLoading } = useMe();

  if (isLoading) return <div className="p-8">Loading profile...</div>;
  if (!user) return <div className="p-8">Profile not found</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-4xl text-primary-foreground font-semibold">
          {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'JD'}
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Roles & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Assigned Roles</p>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role: any) => (
                  <Badge key={role.id} variant="outline">{role.name}</Badge>
                ))}
                {!user.roles?.length && <span className="text-sm text-muted-foreground">No roles assigned</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Associated Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex flex-wrap gap-2">
                {user.companies?.map((company: any) => (
                  <Badge key={company.id} variant="secondary">{company.name}</Badge>
                ))}
                {!user.companies?.length && <span className="text-sm text-muted-foreground">No companies assigned</span>}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
