import { Component, OnInit } from '@angular/core';
import { Traineeservice, Trainee } from '../trainee/traineeservice';
import { map } from 'rxjs';

interface DashboardStats {
  totalTrainees: number;
  totalTrainings: number;
  pendingTrainings: number;
  ongoingTrainings: number;
  completedTrainings: number;
  traineesByTraining: { [key: string]: number };
  upcomingTrainings: Trainee[];
  recentCompletions: Trainee[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  stats: DashboardStats = {
    totalTrainees: 0,
    totalTrainings: 0,
    pendingTrainings: 0,
    ongoingTrainings: 0,
    completedTrainings: 0,
    traineesByTraining: {},
    upcomingTrainings: [],
    recentCompletions: []
  };

  loading = true;
  trainingCategories = ['MEAN', 'CBP', 'SAP', 'Functional'];

  constructor(private traineeService: Traineeservice) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.traineeService.getTrainees().subscribe({
      next: (trainees) => {
        this.calculateStats(trainees);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(trainees: Trainee[]) {
    // Get unique trainees by employeeId
    const uniqueTrainees = new Set(trainees.map(t => t.employeeId));
    this.stats.totalTrainees = uniqueTrainees.size;
    this.stats.totalTrainings = trainees.length;

    // Count by status
    this.stats.pendingTrainings = trainees.filter(t => t.Status === 'Pending').length;
    this.stats.ongoingTrainings = trainees.filter(t => t.Status === 'Ongoing').length;
    this.stats.completedTrainings = trainees.filter(t => t.Status === 'Completed').length;

    // Count by training type
    this.trainingCategories.forEach(training => {
      this.stats.traineesByTraining[training] = trainees.filter(
        t => t.TrainingName === training
      ).length;
    });

    // Upcoming trainings (Pending, sorted by start date)
    this.stats.upcomingTrainings = trainees
      .filter(t => t.Status === 'Pending')
      .sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())
      .slice(0, 5);

    // Recent completions
    this.stats.recentCompletions = trainees
      .filter(t => t.Status === 'Completed')
      .sort((a, b) => new Date(b.EndDate || b.StartDate).getTime() - 
                      new Date(a.EndDate || a.StartDate).getTime())
      .slice(0, 5);
  }

  getStatusPercentage(status: string): number {
    if (this.stats.totalTrainings === 0) return 0;
    const count = status === 'Pending' ? this.stats.pendingTrainings :
                  status === 'Ongoing' ? this.stats.ongoingTrainings :
                  this.stats.completedTrainings;
    return Math.round((count / this.stats.totalTrainings) * 100);
  }
}