'use client';

import React, { useState } from 'react';
import { UnitToggleBar } from '@/components/unit-toggle-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, Settings } from 'lucide-react';

const ToggleDemoPage = () => {
  const [toggleState, setToggleState] = useState(true);
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Unit Toggle Bar Demo</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Toggle Bar Example</CardTitle>
          </CardHeader>
          <CardContent>
            <UnitToggleBar 
              label="Units Section"
              defaultExpanded={true}
              onToggle={(expanded) => setToggleState(expanded)}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Building2 className="text-primary" />
                  <div>
                    <h3 className="font-medium">Computer Science</h3>
                    <p className="text-sm text-muted-foreground">CS Department</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="text-primary" />
                  <div>
                    <h3 className="font-medium">Mathematics</h3>
                    <p className="text-sm text-muted-foreground">Math Department</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="text-primary" />
                  <div>
                    <h3 className="font-medium">Physics</h3>
                    <p className="text-sm text-muted-foreground">Science Department</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Settings className="text-primary" />
                  <div>
                    <h3 className="font-medium">Engineering</h3>
                    <p className="text-sm text-muted-foreground">Engineering Department</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline">View All Units</Button>
                <Button>Add New Unit</Button>
              </div>
            </UnitToggleBar>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">Current toggle state: <strong>{toggleState ? 'Expanded' : 'Collapsed'}</strong></p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Collapsed Toggle Example</CardTitle>
          </CardHeader>
          <CardContent>
            <UnitToggleBar
              label="Additional Information"
              defaultExpanded={false}
              onToggle={(expanded) => console.log('Additional info toggle changed:', expanded)}
            >
              <div className="p-4 bg-muted rounded-lg">
                <p>This content is initially hidden and will appear when the toggle is expanded.</p>
                <p className="mt-2">You can put any content here - forms, lists, or other components.</p>
              </div>
            </UnitToggleBar>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToggleDemoPage;