
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Position type definition
interface Position {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const PositionsPage = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [newPosition, setNewPosition] = useState({
    title: '',
  });
  const [loading, setLoading] = useState(true);

  // Fetch positions from Supabase
  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        throw error;
      }

      setPositions(data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const filteredPositions = positions.filter(position => 
    position.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a new position
  const handleAddPosition = async () => {
    if (!newPosition.title) {
      toast.error('Position title is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('positions')
        .insert([{ 
          title: newPosition.title
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPositions([...positions, data]);
      setNewPosition({ title: '' });
      setIsAddDialogOpen(false);
      toast.success('Position added successfully');
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Failed to add position');
    }
  };

  // Update a position
  const handleEditPosition = async () => {
    if (!currentPosition || !currentPosition.title) {
      toast.error('Position title is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('positions')
        .update({ 
          title: currentPosition.title
        })
        .eq('id', currentPosition.id);

      if (error) {
        throw error;
      }

      setPositions(positions.map(position => 
        position.id === currentPosition.id ? currentPosition : position
      ));
      setIsEditDialogOpen(false);
      toast.success('Position updated successfully');
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error('Failed to update position');
    }
  };

  // Delete a position
  const handleDeletePosition = async () => {
    if (!currentPosition) return;

    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', currentPosition.id);

      if (error) {
        throw error;
      }

      setPositions(positions.filter(position => position.id !== currentPosition.id));
      setIsDeleteDialogOpen(false);
      toast.success('Position deleted successfully');
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete position');
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6" /> Positions Management
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Position
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search positions..."
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
                <TableHead>Title</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-10">Loading positions...</TableCell>
                </TableRow>
              ) : filteredPositions.length > 0 ? (
                filteredPositions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentPosition(position);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentPosition(position);
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
                  <TableCell colSpan={2} className="text-center py-10">
                    {searchTerm ? 'No positions match your search.' : 'No positions found. Add your first position!'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Position Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Position Title</Label>
              <Input
                id="title"
                value={newPosition.title}
                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                placeholder="Enter position title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPosition}>Add Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Position Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          {currentPosition && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Position Title</Label>
                <Input
                  id="edit-title"
                  value={currentPosition.title}
                  onChange={(e) => setCurrentPosition({ ...currentPosition, title: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPosition}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Position Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this position? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePosition}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PositionsPage;
