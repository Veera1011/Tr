import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Traineeservice } from '../traineeservice';
import { EmployeeService, Employee } from '../../employee-management/employeeservice';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traineeform',
  standalone: false,
  templateUrl: './traineeform.html',
  styleUrl: './traineeform.scss'
})
export class Traineeform implements OnInit, OnDestroy {
  traineeform!: FormGroup;
  @Input() trainings: string[] = [];
  @Input() status: string[] = [];
  @Output() formsubmit = new EventEmitter<any>();
  
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  searchTerm: string = '';
  showDropdown: boolean = false;
  
  private subscribers = new Subscription();

  constructor(
    private traineeservice: Traineeservice,
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.traineeform = this.fb.group({
      employeeId: ['', [Validators.required]],
      employeeName: [''],
      TrainingName: ['', [Validators.required]],
      StartDate: ['', [Validators.required]],
      EndDate: [''],
      Status: ['', [Validators.required]]
    });

    this.loadEmployees();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.closeDropdown.bind(this));
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
      this.showDropdown = true;
    } else {
      this.filteredEmployees = this.employees;
      this.showDropdown = false;
    }
  }

  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.searchTerm = `${employee.employeeId} - ${employee.employeeName}`;
    this.showDropdown = false;
    
    this.traineeform.patchValue({
      employeeId: employee.employeeId,
      employeeName: employee.employeeName
    });
  }

  clearEmployee() {
    this.selectedEmployee = null;
    this.searchTerm = '';
    this.traineeform.patchValue({
      employeeId: '',
      employeeName: ''
    });
  }

  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.employee-search')) {
      this.showDropdown = false;
    }
  }

  addTrainee() {
    if (this.traineeform.invalid) return;

    const formData = {
      ...this.traineeform.value,
      StartDate: new Date(this.traineeform.value.StartDate),
      EndDate: this.traineeform.value.EndDate ? new Date(this.traineeform.value.EndDate) : null
    };

    Swal.fire({
      title: 'Add Training',
      text: `Enroll ${this.selectedEmployee?.employeeName} in ${formData.TrainingName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      confirmButtonText: 'Enroll'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscribers.add(
          this.traineeservice.addTrainee(formData).subscribe({
            next: (response) => {
              Swal.fire({
                title: 'Success!',
                text: 'Employee enrolled successfully',
                icon: 'success',
                timer: 2000
              });
              this.resetForm();
              this.formsubmit.emit(response);
            },
            error: (error) => {
              const errorMsg = error.error?.message || 'Error enrolling employee';
              Swal.fire({
                title: 'Enrollment Failed',
                text: errorMsg,
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          })
        );
      }
    });
  }

  resetForm() {
    this.traineeform.reset();
    this.clearEmployee();
  }

  ngOnDestroy(): void {
    this.subscribers.unsubscribe();
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }
}