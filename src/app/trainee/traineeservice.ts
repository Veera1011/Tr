import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface Trainee {
  _id?: any;
  employeeId: string;      // NEW: unique identifier
  employeeName: string;    // CHANGED: lowercase 'e'
  TrainingName: string;
  StartDate: Date;
  EndDate?: Date;
  Status: string;
}

@Injectable({
  providedIn: 'root'
})
export class Traineeservice {

  baseurl = 'http://localhost:5000/trainees';

  constructor(private http: HttpClient) {}

  addTrainee(trainee: Trainee): Observable<Trainee> {
    return this.http.post<Trainee>(`${this.baseurl}`, trainee);
  }

  getTrainees(): Observable<Trainee[]> {
    return this.http.get<{data: Trainee[]}>(this.baseurl)
      .pipe(map(response => response.data));
  }

  getTraineesByEmployeeId(employeeId: string): Observable<Trainee[]> {
    return this.http.get<{data: Trainee[]}>(`${this.baseurl}/employee/${employeeId}`)
      .pipe(map(response => response.data));
  }

  deletebyname(name: string): Observable<any> {
    return this.http.delete<any>(`${this.baseurl}/name/${name}`);
  }

  updateTrainee(id: string, trainee: Trainee): Observable<Trainee> {
    return this.http.put<Trainee>(`${this.baseurl}/${id}`, trainee);
  }

  deleteTrainee(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseurl}/${id}`);
  }
}