import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Holiday } from '@/types/database.types';
import { cn } from "@/lib/utils";

const HolidaysPage = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);
  const [newHoliday, setNewHoliday] = useState<{
    name: string;
    date: Date;
    description?: string;
  }>({
    name: '',
    date: new Date(),
    description: '',
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [loading, setIsLoading] = useState(true);

  // Fetch holidays from Supabase
  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching holidays:', error);
        toast.error("Failed to load holidays");
        return;
      }
      
      // Convert string dates to Date objects for UI
      const formattedData = data.map((holiday: any) => ({
        ...holiday,
        // Keep date as string in ISO format in the state
        date: holiday.date
      }));
      
      setHolidays(formattedData as Holiday[]);
    } catch (error) {
      console.error('Error in fetchHolidays:', error);
      toast.error("An error occurred while fetching holidays");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const filteredHolidays = holidays.filter(holiday => 
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holiday.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Add a new holiday
  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error('Holiday name and date are required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('holidays')
        .insert([{ 
          name: newHoliday.name,
          date: format(newHoliday.date, 'yyyy-MM-dd'),
          description: newHoliday.description || ''
        }])
        .select();

      if (error) {
        throw error;
      }

      // Add the new holiday to the state
      setHolidays([data[0] as Holiday, ...holidays]);
      setNewHoliday({ name: '', date: new Date(), description: '' });
      setIsAddDialogOpen(false);
      toast.success('Holiday added successfully');
    } catch (error) {
      console.error('Error adding holiday:', error);
      toast.error('Failed to add holiday');
    }
  };

  // Update a holiday
  const handleEditHoliday = async () => {
    if (!currentHoliday || !currentHoliday.name || !currentHoliday.date) {
      toast.error('Holiday name and date are required');
      return;
    }

    try {
      const formattedDate = typeof currentHoliday.date === 'string' 
        ? currentHoliday.date 
        : format(currentHoliday.date as unknown as Date, 'yyyy-MM-dd');

      const { error } = await supabase
        .from('holidays')
        .update({ 
          name: currentHoliday.name,
          date: formattedDate,
          description: currentHoliday.description || ''
        })
        .eq('id', currentHoliday.id);

      if (error) {
        throw error;
      }

      setHolidays(holidays.map(holiday => 
        holiday.id === currentHoliday.id ? {...currentHoliday, date: formattedDate} : holiday
      ));
      setIsEditDialogOpen(false);
      toast.success('Holiday updated successfully');
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast.error('Failed to update holiday');
    }
  };

  // Delete a holiday
  const handleDeleteHoliday = async () => {
    if (!currentHoliday) return;

    try {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', currentHoliday.id);

      if (error) {
        throw error;
      }

      setHolidays(holidays.filter(holiday => holiday.id !== currentHoliday.id));
      setIsDeleteDialogOpen(false);
      toast.success('Holiday deleted successfully');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" /> Public Holidays Management
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Holiday
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search holidays..."
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
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Loading holidays...</TableCell>
                </TableRow>
              ) : filteredHolidays.length > 0 ? (
                filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{format(new Date(holiday.date), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>{holiday.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Convert string date to Date object for the Calendar component
                            setCurrentHoliday({
                              ...holiday,
                              date: holiday.date
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentHoliday(holiday);
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
                  <TableCell colSpan={4} className="text-center py-10">
                    {searchTerm ? 'No holidays match your search.' : 'No holidays found. Add your first holiday!'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Holiday Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input
                id="name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="Enter holiday name"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newHoliday.date ? format(newHoliday.date, 'PPP') : 'Select a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newHoliday.date}
                    onSelect={(date) => {
                      if (date) {
                        setNewHoliday({ ...newHoliday, date });
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newHoliday.description || ''}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                placeholder="Enter holiday description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHoliday}>Add Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
          </DialogHeader>
          {currentHoliday && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Holiday Name</Label>
                <Input
                  id="edit-name"
                  value={currentHoliday.name}
                  onChange={(e) => setCurrentHoliday({ ...currentHoliday, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover open={editCalendarOpen} onOpenChange={setEditCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentHoliday.date ? format(new Date(currentHoliday.date), 'PPP') : 'Select a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(currentHoliday.date)}
                      onSelect={(date) => {
                        if (date) {
                          setCurrentHoliday({ 
                            ...currentHoliday, 
                            date: format(date, 'yyyy-MM-dd')
                          });
                          setEditCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentHoliday.description || ''}
                  onChange={(e) => setCurrentHoliday({ ...currentHoliday, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditHoliday}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Holiday Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Holiday</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this holiday? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteHoliday}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HolidaysPage;
