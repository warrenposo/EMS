
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const initialLeaves = [
  { id: 1, employeeId: "EMP001", employeeName: "John Doe", leaveType: "Annual", startDate: "2023-05-10", endDate: "2023-05-15", days: 5, reason: "Family vacation", status: "Approved" },
  { id: 2, employeeId: "EMP002", employeeName: "Jane Smith", leaveType: "Sick", startDate: "2023-05-05", endDate: "2023-05-06", days: 2, reason: "Flu", status: "Approved" },
  { id: 3, employeeId: "EMP003", employeeName: "Michael Johnson", leaveType: "Personal", startDate: "2023-05-20", endDate: "2023-05-22", days: 3, reason: "Personal matters", status: "Pending" },
  { id: 4, employeeId: "EMP004", employeeName: "Sarah Williams", leaveType: "Annual", startDate: "2023-06-01", endDate: "2023-06-05", days: 5, reason: "Vacation", status: "Pending" },
  { id: 5, employeeId: "EMP005", employeeName: "David Brown", leaveType: "Maternity", startDate: "2023-07-01", endDate: "2023-10-01", days: 90, reason: "Maternity leave", status: "Approved" },
];

const LeavesPage = () => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLeave, setCurrentLeave] = useState<any>(null);
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    employeeName: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    days: 0,
    reason: '',
    status: 'Pending'
  });

  const leaveTypes = ['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Bereavement', 'Study'];

  const filteredLeaves = leaves.filter(leave => 
    leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLeave = () => {
    const leave = {
      id: leaves.length + 1,
      ...newLeave
    };
    setLeaves([...leaves, leave]);
    setNewLeave({ employeeId: '', employeeName: '', leaveType: 'Annual', startDate: '', endDate: '', days: 0, reason: '', status: 'Pending' });
    setIsAddDialogOpen(false);
    toast.success('Leave request added successfully');
  };

  const handleEditLeave = () => {
    setLeaves(leaves.map(l => 
      l.id === currentLeave.id ? { ...currentLeave } : l
    ));
    setIsEditDialogOpen(false);
    toast.success('Leave request updated successfully');
  };

  const handleDeleteLeave = () => {
    setLeaves(leaves.filter(l => l.id !== currentLeave.id));
    setIsDeleteDialogOpen(false);
    toast.success('Leave request deleted successfully');
  };

  const handleApproveLeave = (id: number) => {
    setLeaves(leaves.map(l => 
      l.id === id ? { ...l, status: 'Approved' } : l
    ));
    toast.success('Leave request approved');
  };

  const handleRejectLeave = (id: number) => {
    setLeaves(leaves.map(l => 
      l.id === id ? { ...l, status: 'Rejected' } : l
    ));
    toast.success('Leave request rejected');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Leaves</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Leave Request
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search leaves..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.employeeId}</TableCell>
                  <TableCell className="font-medium">{leave.employeeName}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{leave.startDate}</TableCell>
                  <TableCell>{leave.endDate}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      leave.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : leave.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {leave.status === 'Pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveLeave(leave.id)}
                            title="Approve"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectLeave(leave.id)}
                            title="Reject"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentLeave(leave);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentLeave(leave);
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
                <TableCell colSpan={9} className="text-center">No leave requests found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Leave Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={newLeave.employeeId}
                onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={newLeave.employeeName}
                onChange={(e) => setNewLeave({ ...newLeave, employeeName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <select
                id="leaveType"
                value={newLeave.leaveType}
                onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => {
                    const startDate = new Date(newLeave.startDate);
                    const endDate = new Date(e.target.value);
                    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    
                    setNewLeave({ 
                      ...newLeave, 
                      endDate: e.target.value,
                      days: isNaN(diffDays) ? 0 : diffDays
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                value={newLeave.days}
                onChange={(e) => setNewLeave({ ...newLeave, days: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLeave}>Add Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
          </DialogHeader>
          {currentLeave && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employeeId">Employee ID</Label>
                <Input
                  id="edit-employeeId"
                  value={currentLeave.employeeId}
                  onChange={(e) => setCurrentLeave({ ...currentLeave, employeeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employeeName">Employee Name</Label>
                <Input
                  id="edit-employeeName"
                  value={currentLeave.employeeName}
                  onChange={(e) => setCurrentLeave({ ...currentLeave, employeeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-leaveType">Leave Type</Label>
                <select
                  id="edit-leaveType"
                  value={currentLeave.leaveType}
                  onChange={(e) => setCurrentLeave({ ...currentLeave, leaveType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={currentLeave.startDate}
                    onChange={(e) => setCurrentLeave({ ...currentLeave, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={currentLeave.endDate}
                    onChange={(e) => {
                      const startDate = new Date(currentLeave.startDate);
                      const endDate = new Date(e.target.value);
                      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      
                      setCurrentLeave({ 
                        ...currentLeave, 
                        endDate: e.target.value,
                        days: isNaN(diffDays) ? 0 : diffDays
                      });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-days">Number of Days</Label>
                <Input
                  id="edit-days"
                  type="number"
                  value={currentLeave.days}
                  onChange={(e) => setCurrentLeave({ ...currentLeave, days: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reason">Reason</Label>
                <Input
                  id="edit-reason"
                  value={currentLeave.reason}
                  onChange={(e) => setCurrentLeave({ ...currentLeave, reason: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={currentLeave.status}
                  onChange={(e) => setCurrentLeave({ ...currentLeave, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditLeave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Leave Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Leave Request</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this leave request? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLeave}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavesPage;
