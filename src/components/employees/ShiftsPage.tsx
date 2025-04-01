
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Department, Timetable, Shift, ShiftWithRelations } from '@/types/database.types';

const ShiftsPage = () => {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [newShift, setNewShift] = useState<Omit<Shift, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    timetable_id: null,
    department_id: null,
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
    color: null,
  });
  const [shifts, setShifts] = useState<ShiftWithRelations[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Fetch shifts with relations
  useEffect(() => {
    fetchShifts();
  }, []);

  // Fetch shifts function
  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      // First get timetables for reference
      const { data: timetablesData, error: timetablesError } = await supabase
        .from('timetables')
        .select('*');
        
      if (timetablesError) {
        console.error('Error fetching timetables:', timetablesError);
        toast.error("Failed to load timetables");
        return;
      }
      
      setTimetables(timetablesData as Timetable[]);
      
      // Then get departments for reference
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*');
        
      if (departmentsError) {
        console.error('Error fetching departments:', departmentsError);
        toast.error("Failed to load departments");
        return;
      }
      
      setDepartments(departmentsData as Department[]);
      
      // Now get the shifts
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching shifts:', error);
        toast.error("Failed to load shifts");
        return;
      }
      
      // Enhance shifts with related data for display
      const shiftsWithRelations: ShiftWithRelations[] = data.map((shift: Shift) => {
        const timetable = timetablesData.find(t => t.id === shift.timetable_id);
        const department = departmentsData.find(d => d.id === shift.department_id);
        
        return {
          ...shift,
          timetable: timetable as Timetable,
          department: department as Department
        };
      });
      
      setShifts(shiftsWithRelations);
    } catch (error) {
      console.error('Error in fetchShifts:', error);
      toast.error("An error occurred while fetching shifts");
    } finally {
      setIsLoading(false);
    }
  };

  // Add shift
  const handleAddShift = async () => {
    if (!newShift.name.trim()) {
      toast.error("Shift name is required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          name: newShift.name,
          timetable_id: newShift.timetable_id,
          department_id: newShift.department_id,
          start_date: format(startDate || new Date(), "yyyy-MM-dd"),
          end_date: format(endDate || new Date(), "yyyy-MM-dd"),
          color: newShift.color
        }])
        .select();
        
      if (error) {
        throw error;
      }

      toast.success("Shift added successfully");
      setIsAddDialogOpen(false);
      fetchShifts(); // Refresh the list
    } catch (error) {
      console.error('Error adding shift:', error);
      toast.error("Failed to add shift");
    }
  };

  // Update shift
  const handleEditShift = async () => {
    if (!selectedShift) return;
    if (!selectedShift.name.trim()) {
      toast.error("Shift name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .update({
          name: selectedShift.name,
          timetable_id: selectedShift.timetable_id,
          department_id: selectedShift.department_id,
          start_date: format(startDate || new Date(), "yyyy-MM-dd"),
          end_date: format(endDate || new Date(), "yyyy-MM-dd"),
          color: selectedShift.color
        })
        .eq('id', selectedShift.id);
        
      if (error) {
        throw error;
      }

      toast.success("Shift updated successfully");
      setIsEditDialogOpen(false);
      fetchShifts(); // Refresh the list
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error("Failed to update shift");
    }
  };

  // Delete shift
  const handleDeleteShift = async () => {
    if (!selectedShift) return;

    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', selectedShift.id);
        
      if (error) {
        throw error;
      }

      toast.success("Shift deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchShifts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error("Failed to delete shift");
    }
  };

  // Filter shifts based on search input
  const filteredShifts = shifts.filter(shift => 
    shift.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAdd = () => {
    setNewShift({
      name: '',
      timetable_id: null,
      department_id: null,
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(), "yyyy-MM-dd"),
      color: null,
    });
    setStartDate(new Date());
    setEndDate(new Date());
    setIsAddDialogOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setStartDate(new Date(shift.start_date));
    setEndDate(new Date(shift.end_date));
    setIsEditDialogOpen(true);
  };

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Shift Management</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 md:p-5">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" className="flex items-center gap-1" onClick={handleAdd}>
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => selectedShift && handleEdit(selectedShift)}
              disabled={!selectedShift}
            >
              <Edit size={16} />
              <span className={isMobile ? "sr-only" : ""}>Update</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => selectedShift && handleDelete(selectedShift)}
              disabled={!selectedShift}
            >
              <Trash2 size={16} />
              <span className={isMobile ? "sr-only" : ""}>Delete</span>
            </Button>
          </div>
          
          {/* Search filter */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search shifts..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="form-input"
              />
            </div>
            <Button className="flex items-center gap-1 flex-shrink-0">
              <Search size={16} />
              <span>Search</span>
            </Button>
          </div>
          
          {/* Shifts table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shift Name</TableHead>
                  <TableHead>Timetable</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading shifts...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredShifts.length > 0 ? (
                  filteredShifts.map((shift) => (
                    <TableRow 
                      key={shift.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedShift?.id === shift.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedShift(shift)}
                    >
                      <TableCell className="font-medium">{shift.name}</TableCell>
                      <TableCell>{shift.timetable?.name || 'N/A'}</TableCell>
                      <TableCell>{shift.department?.name || 'N/A'}</TableCell>
                      <TableCell>{shift.start_date}</TableCell>
                      <TableCell>{shift.end_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No shifts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input 
                id="name" 
                value={newShift.name} 
                onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                placeholder="Enter shift name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timetable">Timetable</Label>
              <select
                id="timetable"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newShift.timetable_id || ''}
                onChange={(e) => setNewShift({...newShift, timetable_id: e.target.value || null})}
              >
                <option value="">Select Timetable</option>
                {timetables.map(timetable => (
                  <option key={timetable.id} value={timetable.id}>{timetable.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newShift.department_id || ''}
                onChange={(e) => setNewShift({...newShift, department_id: e.target.value || null})}
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy-MM-dd") : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddShift}>Add Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Shift Name</Label>
                <Input 
                  id="edit-name" 
                  value={selectedShift.name} 
                  onChange={(e) => setSelectedShift({...selectedShift, name: e.target.value})}
                  placeholder="Enter shift name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timetable">Timetable</Label>
                <select
                  id="timetable"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedShift.timetable_id || ''}
                  onChange={(e) => setSelectedShift({...selectedShift, timetable_id: e.target.value || null})}
                >
                  <option value="">Select Timetable</option>
                  {timetables.map(timetable => (
                    <option key={timetable.id} value={timetable.id}>{timetable.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedShift.department_id || ''}
                  onChange={(e) => setSelectedShift({...selectedShift, department_id: e.target.value || null})}
                >
                  <option value="">Select Department</option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "yyyy-MM-dd") : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "yyyy-MM-dd") : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditShift}>Update Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shift Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedShift && (
              <p className="text-sm text-gray-500">
                You are about to delete shift: <span className="font-medium text-gray-900">{selectedShift.name}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteShift}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftsPage;
