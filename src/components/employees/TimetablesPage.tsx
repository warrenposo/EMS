import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Timetable } from '@/types/database.types';

const TimetablesPage = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTimetable, setCurrentTimetable] = useState<Timetable | null>(null);
  const [newTimetable, setNewTimetable] = useState<Omit<Timetable, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    break_start: '12:00',
    break_end: '13:00',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch timetables from Supabase
  const fetchTimetables = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching timetables:', error);
        toast.error("Failed to load timetables");
        return;
      }
      
      setTimetables(data as Timetable[]);
    } catch (error) {
      console.error('Error in fetchTimetables:', error);
      toast.error("An error occurred while fetching timetables");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const filteredTimetables = timetables.filter(timetable => 
    timetable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (timetable.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Format time for display
  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time;
  };

  // Add a new timetable
  const handleAddTimetable = async () => {
    if (!newTimetable.name || !newTimetable.start_time || !newTimetable.end_time) {
      toast.error('Timetable name, start time, and end time are required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('timetables')
        .insert([{ 
          name: newTimetable.name,
          start_time: newTimetable.start_time,
          end_time: newTimetable.end_time,
          break_start: newTimetable.break_start || null,
          break_end: newTimetable.break_end || null,
          description: newTimetable.description || ''
        }])
        .select();

      if (error) {
        throw error;
      }

      setTimetables([...timetables, data[0] as Timetable]);
      setNewTimetable({
        name: '',
        start_time: '09:00',
        end_time: '17:00',
        break_start: '12:00',
        break_end: '13:00',
        description: '',
      });
      setIsAddDialogOpen(false);
      toast.success('Timetable added successfully');
    } catch (error) {
      console.error('Error adding timetable:', error);
      toast.error('Failed to add timetable');
    }
  };

  // Update a timetable
  const handleEditTimetable = async () => {
    if (!currentTimetable || !currentTimetable.name || !currentTimetable.start_time || !currentTimetable.end_time) {
      toast.error('Timetable name, start time, and end time are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('timetables')
        .update({ 
          name: currentTimetable.name,
          start_time: currentTimetable.start_time,
          end_time: currentTimetable.end_time,
          break_start: currentTimetable.break_start,
          break_end: currentTimetable.break_end,
          description: currentTimetable.description
        })
        .eq('id', currentTimetable.id);

      if (error) {
        throw error;
      }

      setTimetables(timetables.map(timetable => 
        timetable.id === currentTimetable.id ? currentTimetable : timetable
      ));
      setIsEditDialogOpen(false);
      toast.success('Timetable updated successfully');
    } catch (error) {
      console.error('Error updating timetable:', error);
      toast.error('Failed to update timetable');
    }
  };

  // Delete a timetable
  const handleDeleteTimetable = async () => {
    if (!currentTimetable) return;

    try {
      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', currentTimetable.id);

      if (error) {
        throw error;
      }

      setTimetables(timetables.filter(timetable => timetable.id !== currentTimetable.id));
      setIsDeleteDialogOpen(false);
      toast.success('Timetable deleted successfully');
    } catch (error) {
      console.error('Error deleting timetable:', error);
      toast.error('Failed to delete timetable');
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6" /> Timetables Management
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Timetable
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search timetables..."
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
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Break Start</TableHead>
                <TableHead>Break End</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading timetables...</TableCell>
                </TableRow>
              ) : filteredTimetables.length > 0 ? (
                filteredTimetables.map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell className="font-medium">{timetable.name}</TableCell>
                    <TableCell>{formatTime(timetable.start_time)}</TableCell>
                    <TableCell>{formatTime(timetable.end_time)}</TableCell>
                    <TableCell>{formatTime(timetable.break_start)}</TableCell>
                    <TableCell>{formatTime(timetable.break_end)}</TableCell>
                    <TableCell>{timetable.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentTimetable(timetable);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentTimetable(timetable);
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
                  <TableCell colSpan={7} className="text-center py-10">
                    {searchTerm ? 'No timetables match your search.' : 'No timetables found. Add your first timetable!'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Timetable Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Timetable Name</Label>
              <Input
                id="name"
                value={newTimetable.name}
                onChange={(e) => setNewTimetable({ ...newTimetable, name: e.target.value })}
                placeholder="Enter timetable name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={newTimetable.start_time}
                onChange={(e) => setNewTimetable({ ...newTimetable, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={newTimetable.end_time}
                onChange={(e) => setNewTimetable({ ...newTimetable, end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-start">Break Start Time (Optional)</Label>
              <Input
                id="break-start"
                type="time"
                value={newTimetable.break_start || ''}
                onChange={(e) => setNewTimetable({ ...newTimetable, break_start: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-end">Break End Time (Optional)</Label>
              <Input
                id="break-end"
                type="time"
                value={newTimetable.break_end || ''}
                onChange={(e) => setNewTimetable({ ...newTimetable, break_end: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTimetable.description || ''}
                onChange={(e) => setNewTimetable({ ...newTimetable, description: e.target.value || null })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTimetable}>Add Timetable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Timetable Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable</DialogTitle>
          </DialogHeader>
          {currentTimetable && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Timetable Name</Label>
                <Input
                  id="edit-name"
                  value={currentTimetable.name}
                  onChange={(e) => setCurrentTimetable({ ...currentTimetable, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-start-time">Start Time</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={currentTimetable.start_time}
                  onChange={(e) => setCurrentTimetable({ ...currentTimetable, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-time">End Time</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={currentTimetable.end_time}
                  onChange={(e) => setCurrentTimetable({ ...currentTimetable, end_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-break-start">Break Start Time (Optional)</Label>
                <Input
                  id="edit-break-start"
                  type="time"
                  value={currentTimetable.break_start || ''}
                  onChange={(e) => setCurrentTimetable({ ...currentTimetable, break_start: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-break-end">Break End Time (Optional)</Label>
                <Input
                  id="edit-break-end"
                  type="time"
                  value={currentTimetable.break_end || ''}
                  onChange={(e) => setCurrentTimetable({ ...currentTimetable, break_end: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={currentTimetable.description || ''}
                  onChange={(e) => setCurrentTimetable({ ...currentTimetable, description: e.target.value || null })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTimetable}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Timetable Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timetable</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this timetable? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTimetable}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TimetablesPage;
