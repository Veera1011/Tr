import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Employee {
  _id?: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  joiningDate: Date;
  phone?: string;
  isActive?: boolean;
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data?: Employee | Employee[];
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  
  baseurl = 'http://localhost:5000/employees';

  constructor(private http: HttpClient) {}

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<EmployeeResponse>(this.baseurl, employee)
      .pipe(map(response => response.data as Employee));
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<EmployeeResponse>(this.baseurl)
      .pipe(map(response => response.data as Employee[]));
  }

  getEmployeeById(employeeId: string): Observable<Employee> {
    return this.http.get<EmployeeResponse>(`${this.baseurl}/${employeeId}`)
      .pipe(map(response => response.data as Employee));
  }

  updateEmployee(employeeId: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<EmployeeResponse>(`${this.baseurl}/${employeeId}`, employee)
      .pipe(map(response => response.data as Employee));
  }

  deleteEmployee(employeeId: string): Observable<any> {
    return this.http.delete<EmployeeResponse>(`${this.baseurl}/${employeeId}`);
  }

  searchEmployees(query: string): Observable<Employee[]> {
    return this.http.get<EmployeeResponse>(`${this.baseurl}/search`, {
      params: { query }
    }).pipe(map(response => response.data as Employee[]));
  }
}