import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Area type definition
interface Area {
  id: string;
  name: string;
  coordinates: string | null;
  created_at?: string;
  updated_at?: string;
}

const AreasPage = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [newArea, setNewArea] = useState({
    name: '',
    coordinates: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch areas from Supabase
  const fetchAreas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Update this part of your data processing
      const formattedData = data.map(area => ({
        id: area.id,
        name: area.name,
        coordinates: area.coordinates ? String(area.coordinates) : null,
        created_at: area.created_at,
        updated_at: area.updated_at
      }));

      setAreas(formattedData);
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error('Failed to load areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a new area
  const handleAddArea = async () => {
    if (!newArea.name) {
      toast.error('Area name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('areas')
        .insert([{ 
          name: newArea.name,
          coordinates: newArea.coordinates || null
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Convert coordinates to string for type compatibility
      const newAreaWithStringCoordinates: Area = {
        ...data,
        coordinates: data.coordinates ? String(data.coordinates) : null
      };

      setAreas([...areas, newAreaWithStringCoordinates]);
      setNewArea({ name: '', coordinates: '' });
      setIsAddDialogOpen(false);
      toast.success('Area added successfully');
    } catch (error) {
      console.error('Error adding area:', error);
      toast.error('Failed to add area');
    }
  };

  // Update an area
  const handleEditArea = async () => {
    if (!currentArea || !currentArea.name) {
      toast.error('Area name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('areas')
        .update({ 
          name: currentArea.name,
          coordinates: currentArea.coordinates
        })
        .eq('id', currentArea.id);

      if (error) {
        throw error;
      }

      setAreas(areas.map(area => 
        area.id === currentArea.id ? currentArea : area
      ));
      setIsEditDialogOpen(false);
      toast.success('Area updated successfully');
    } catch (error) {
      console.error('Error updating area:', error);
      toast.error('Failed to update area');
    }
  };

  // Delete an area
  const handleDeleteArea = async () => {
    if (!currentArea) return;

    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', currentArea.id);

      if (error) {
        throw error;
      }

      setAreas(areas.filter(area => area.id !== currentArea.id));
      setIsDeleteDialogOpen(false);
      toast.success('Area deleted successfully');
    } catch (error) {
      console.error('Error deleting area:', error);
      toast.error('Failed to delete area');
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Map className="h-6 w-6" /> Areas Management
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Area
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search areas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">Loading areas...</TableCell>
                </TableRow>
              ) : filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.coordinates || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentArea(area);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentArea(area);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    {searchTerm ? 'No areas match your search.' : 'No areas found. Add your first area!'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Area Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Area Name</Label>
              <Input
                id="name"
                value={newArea.name}
                onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                placeholder="Enter area name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinates">Coordinates (Optional)</Label>
              <Input
                id="coordinates"
                value={newArea.coordinates}
                onChange={(e) => setNewArea({ ...newArea, coordinates: e.target.value })}
                placeholder="Enter coordinates"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddArea}>Add Area</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Area Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Area</DialogTitle>
          </DialogHeader>
          {currentArea && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Area Name</Label>
                <Input
                  id="edit-name"
                  value={currentArea.name}
                  onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-coordinates">Coordinates (Optional)</Label>
                <Input
                  id="edit-coordinates"
                  value={currentArea.coordinates || ''}
                  onChange={(e) => setCurrentArea({ ...currentArea, coordinates: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditArea}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Area Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Area</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this area? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteArea}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AreasPage;
