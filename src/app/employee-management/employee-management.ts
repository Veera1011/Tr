import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService, Employee } from './employeeservice';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-management',
  standalone: false,
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.scss'
})
export class EmployeeManagement implements OnInit {
  employeeForm!: FormGroup;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  isEditMode: boolean = false;
  selectedEmployeeId: string = '';

  departments = ['HR', 'IT', 'Finance', 'Operations', 'Sales', 'Marketing'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
  }

  initForm() {
    this.employeeForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.pattern(/^EMP\d{5}$/)]],
      employeeName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      joiningDate: ['', Validators.required],
      phone: ['', [Validators.pattern(/^\d{10}$/)]]
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  searchEmployees() {
    if (this.searchTerm.trim()) {
      this.filteredEmployees = this.employees.filter(emp =>
        emp.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredEmployees = this.employees;
    }
  }

  submitForm() {
    if (this.employeeForm.invalid) return;

    const employeeData = {
      ...this.employeeForm.value,
      joiningDate: new Date(this.employeeForm.value.joiningDate)
    };

    if (this.isEditMode) {
      this.updateEmployee(employeeData);
    } else {
      this.createEmployee(employeeData);
    }
  }

  createEmployee(employeeData: Employee) {
    Swal.fire({
      title: 'Add Employee',
      text: 'Do you want to add this employee?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      confirmButtonText: 'Add'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Success!',
              text: 'Employee added successfully',
              icon: 'success',
              timer: 2000
            });
            this.employeeForm.reset();
            this.loadEmployees();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error!',
              text: error.error?.message || 'Error adding employee',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  updateEmployee(employeeData: Employee) {
    this.employeeService.updateEmployee(this.selectedEmployeeId, employeeData).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Success!',
          text: 'Employee updated successfully',
          icon: 'success',
          timer: 2000
        });
        this.cancelEdit();
        this.loadEmployees();
      },
      error: (error) => {
        Swal.fire({
          title: 'Error!',
          text: error.error?.message || 'Error updating employee',
          icon: 'error'
        });
      }
    });
  }

  editEmployee(employee: Employee) {
    this.isEditMode = true;
    this.selectedEmployeeId = employee.employeeId;
    
    this.employeeForm.patchValue({
      ...employee,
      joiningDate: new Date(employee.joiningDate).toISOString().split('T')[0]
    });

    // Disable employeeId field when editing
    this.employeeForm.get('employeeId')?.disable();
  }

  deleteEmployee(employeeId: string, employeeName: string) {
    Swal.fire({
      title: 'Delete Employee',
      text: `Are you sure you want to deactivate ${employeeName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(employeeId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Employee deactivated successfully',
              icon: 'success',
              timer: 2000
            });
            this.loadEmployees();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error!',
              text: error.error?.message || 'Error deleting employee',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.selectedEmployeeId = '';
    this.employeeForm.reset();
    this.employeeForm.get('employeeId')?.enable();
  }

  autoGenerateEmployeeId() {
    const count = this.employees.length + 1;
    const newId = `EMP${String(count).padStart(5, '0')}`;
    this.employeeForm.patchValue({ employeeId: newId });
  }
}