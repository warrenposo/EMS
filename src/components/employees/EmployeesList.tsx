
import React, { useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, Filter, Download, Upload, 
  Building, Map, UserPlus, Calculator 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, getDepartments, getPositions, addEmployee, updateEmployee, deleteEmployee, Employee } from '@/lib/employees';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';

const EmployeesList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    badge_number: '',
    first_name: '',
    last_name: '',
    gender: '',
    department_id: '',
    position_id: '',
    email: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  // Fetch employees with search filters
  const { data: employeesData = { data: [], count: 0 }, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', currentPage, pageSize, searchId, searchName, searchDepartment],
    queryFn: () => getEmployees({
      idFilter: searchId,
      nameFilter: searchName,
      departmentFilter: searchDepartment,
      page: currentPage,
      pageSize
    })
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  });

  // Fetch positions
  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: getPositions
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsAddDialogOpen(false);
      toast.success('Employee added successfully');
    },
    onError: (error) => {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: (employee: Employee) => {
      if (!employee.id) throw new Error('Employee ID is required');
      return updateEmployee(employee.id, employee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsEditDialogOpen(false);
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeleteDialogOpen(false);
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  });

  const handleSearch = () => {
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const handleAdd = () => {
    setNewEmployee({
      badge_number: '',
      first_name: '',
      last_name: '',
      gender: '',
      department_id: '',
      position_id: '',
      email: '',
      hire_date: new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newEmployee.badge_number || !newEmployee.first_name || !newEmployee.last_name || !newEmployee.email || !newEmployee.hire_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    addEmployeeMutation.mutate(newEmployee);
  };

  const confirmEdit = () => {
    if (!newEmployee.badge_number || !newEmployee.first_name || !newEmployee.last_name || !newEmployee.email || !newEmployee.hire_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    updateEmployeeMutation.mutate(newEmployee);
  };

  const confirmDelete = () => {
    if (!selectedEmployee?.id) return;
    deleteEmployeeMutation.mutate(selectedEmployee.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <ConnectionStatus />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" className="flex items-center gap-1" onClick={handleAdd}>
              <Plus size={16} />
              <span>Add</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => selectedEmployee && handleEdit(selectedEmployee)}
              disabled={!selectedEmployee}
            >
              <Edit size={16} />
              <span>Update</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => selectedEmployee && handleDelete(selectedEmployee)}
              disabled={!selectedEmployee}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter size={16} />
              <span>Select</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Building size={16} />
              <span>Update Department</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Map size={16} />
              <span>Update Area</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <UserPlus size={16} />
              <span>Add Transaction</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Calculator size={16} />
              <span>Calculations</span>
            </Button>
          </div>
          
          {/* Search filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="relative">
              <Select
                value={searchDepartment}
                onValueChange={setSearchDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_departments">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-1 flex-shrink-0" onClick={handleSearch}>
                <Search size={16} />
                <span>Search</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1 flex-shrink-0">
                <Upload size={16} />
                <span>Import</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1 flex-shrink-0">
                <Download size={16} />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          {/* Employees table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hired Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingEmployees ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading employees...</p>
                    </TableCell>
                  </TableRow>
                ) : employeesData.data.length > 0 ? (
                  employeesData.data.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedEmployee?.id === employee.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <TableCell>{employee.badge_number}</TableCell>
                      <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
                      <TableCell>{employee.gender || '-'}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone || employee.mobile || '-'}</TableCell>
                      <TableCell>{employee.hire_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {employeesData.data.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, employeesData.count)} of {employeesData.count} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={(currentPage * pageSize) >= employeesData.count}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter employee details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="badge_number">Badge Number *</Label>
              <Input
                id="badge_number"
                value={newEmployee.badge_number}
                onChange={(e) => setNewEmployee({...newEmployee, badge_number: e.target.value})}
                placeholder="Enter badge number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={newEmployee.gender || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, gender: value})}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={newEmployee.department_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, department_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="department_id">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_id">Position</Label>
              <Select
                value={newEmployee.position_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, position_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="position_id">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select position</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newEmployee.phone || ''}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={newEmployee.mobile || ''}
                onChange={(e) => setNewEmployee({...newEmployee, mobile: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date *</Label>
              <Input
                id="hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_no">Card Number</Label>
              <Input
                id="card_no"
                value={newEmployee.card_no || ''}
                onChange={(e) => setNewEmployee({...newEmployee, card_no: e.target.value})}
                placeholder="Enter card number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_no">Passport Number</Label>
              <Input
                id="passport_no"
                value={newEmployee.passport_no || ''}
                onChange={(e) => setNewEmployee({...newEmployee, passport_no: e.target.value})}
                placeholder="Enter passport number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_badge_number">Badge Number *</Label>
              <Input
                id="edit_badge_number"
                value={newEmployee.badge_number}
                onChange={(e) => setNewEmployee({...newEmployee, badge_number: e.target.value})}
                placeholder="Enter badge number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_first_name">First Name *</Label>
              <Input
                id="edit_first_name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_last_name">Last Name *</Label>
              <Input
                id="edit_last_name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_gender">Gender</Label>
              <Select
                value={newEmployee.gender || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, gender: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="edit_gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_department_id">Department</Label>
              <Select
                value={newEmployee.department_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, department_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="edit_department_id">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_position_id">Position</Label>
              <Select
                value={newEmployee.position_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, position_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="edit_position_id">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select position</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={newEmployee.phone || ''}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_mobile">Mobile</Label>
              <Input
                id="edit_mobile"
                value={newEmployee.mobile || ''}
                onChange={(e) => setNewEmployee({...newEmployee, mobile: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hire_date">Hire Date *</Label>
              <Input
                id="edit_hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedEmployee && (
              <p className="text-sm text-gray-500">
                You are about to delete employee: <span className="font-medium text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesList;
