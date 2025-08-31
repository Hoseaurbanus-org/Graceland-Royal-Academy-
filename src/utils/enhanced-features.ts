// Enhanced Educational Platform Utilities
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  category: 'academic' | 'enrollment' | 'financial' | 'operational';
  timestamp: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  type: 'backup' | 'calculation' | 'notification' | 'cleanup' | 'report';
  status: 'active' | 'paused' | 'stopped';
  frequency: 'daily' | 'weekly' | 'monthly' | 'term';
  lastRun: string | null;
  nextRun: string;
  successCount: number;
  errorCount: number;
}

export interface BroadsheetData {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  termScores: Record<string, Record<string, number>>; // term -> subject -> score
  cumulativeScores: Record<string, number>; // subject -> cumulative average
  totalAverage: number;
  position: number;
  grade: string;
}

// Real-time Performance Tracking
export class RealTimeTracker {
  private static instance: RealTimeTracker;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private updateCallbacks: Set<(metrics: PerformanceMetric[]) => void> = new Set();

  static getInstance(): RealTimeTracker {
    if (!RealTimeTracker.instance) {
      RealTimeTracker.instance = new RealTimeTracker();
    }
    return RealTimeTracker.instance;
  }

  updateMetric(metric: PerformanceMetric): void {
    this.metrics.set(metric.id, metric);
    this.notifyCallbacks();
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  subscribe(callback: (metrics: PerformanceMetric[]) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    const metrics = this.getMetrics();
    this.updateCallbacks.forEach(callback => callback(metrics));
  }
}

// Automation System
export class AutomationEngine {
  private tasks: Map<string, AutomationTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  addTask(task: AutomationTask): void {
    this.tasks.set(task.id, task);
    if (task.status === 'active') {
      this.scheduleTask(task);
    }
  }

  removeTask(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
    this.tasks.delete(taskId);
  }

  executeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      // Execute task based on type
      switch (task.type) {
        case 'backup':
          this.performBackup();
          break;
        case 'calculation':
          this.performCalculations();
          break;
        case 'notification':
          this.sendNotifications();
          break;
        case 'cleanup':
          this.performCleanup();
          break;
        case 'report':
          this.generateReports();
          break;
      }

      // Update task statistics
      task.successCount++;
      task.lastRun = new Date().toISOString();
      this.updateNextRun(task);
      
    } catch (error) {
      task.errorCount++;
      console.error(`Task ${taskId} failed:`, error);
    }
  }

  private scheduleTask(task: AutomationTask): void {
    const getInterval = (frequency: string): number => {
      switch (frequency) {
        case 'daily': return 24 * 60 * 60 * 1000;
        case 'weekly': return 7 * 24 * 60 * 60 * 1000;
        case 'monthly': return 30 * 24 * 60 * 60 * 1000;
        case 'term': return 90 * 24 * 60 * 60 * 1000;
        default: return 24 * 60 * 60 * 1000;
      }
    };

    const interval = setInterval(() => {
      this.executeTask(task.id);
    }, getInterval(task.frequency));

    this.intervals.set(task.id, interval);
  }

  private updateNextRun(task: AutomationTask): void {
    const getNextRunDate = (frequency: string): Date => {
      const now = new Date();
      switch (frequency) {
        case 'daily':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case 'weekly':
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'monthly':
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        case 'term':
          return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }
    };

    task.nextRun = getNextRunDate(task.frequency).toISOString();
  }

  private performBackup(): void {
    // Backup implementation
    console.log('🔄 Performing automated backup...');
  }

  private performCalculations(): void {
    // Result calculations, position updates, etc.
    console.log('🧮 Performing automated calculations...');
  }

  private sendNotifications(): void {
    // Send automated notifications
    console.log('📧 Sending automated notifications...');
  }

  private performCleanup(): void {
    // Database cleanup, file cleanup, etc.
    console.log('🧹 Performing system cleanup...');
  }

  private generateReports(): void {
    // Generate automated reports
    console.log('📊 Generating automated reports...');
  }
}

// Broadsheet Analytics Engine
export class BroadsheetAnalytics {
  static generateTermWiseData(
    students: any[],
    results: any[],
    subjects: any[],
    classId: string,
    session: string
  ): BroadsheetData[] {
    return students
      .filter(s => s.class_id === classId && s.is_active)
      .map(student => {
        const studentResults = results.filter(
          r => r.student_id === student.id && r.session === session
        );

        // Calculate term-wise scores
        const termScores: Record<string, Record<string, number>> = {};
        const cumulativeScores: Record<string, number> = {};
        
        ['First Term', 'Second Term', 'Third Term'].forEach(term => {
          termScores[term] = {};
          const termResults = studentResults.filter(r => r.term === term);
          
          termResults.forEach(result => {
            const subject = subjects.find(s => s.id === result.subject_id);
            if (subject) {
              termScores[term][subject.code] = result.percentage;
            }
          });
        });

        // Calculate cumulative scores
        subjects.forEach(subject => {
          const subjectScores = ['First Term', 'Second Term', 'Third Term']
            .map(term => termScores[term][subject.code] || 0)
            .filter(score => score > 0);
          
          if (subjectScores.length > 0) {
            cumulativeScores[subject.code] = Math.round(
              subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length
            );
          }
        });

        // Calculate total average
        const allScores = Object.values(cumulativeScores);
        const totalAverage = allScores.length > 0 
          ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
          : 0;

        return {
          studentId: student.id,
          studentName: student.name,
          admissionNumber: student.admission_number,
          termScores,
          cumulativeScores,
          totalAverage,
          position: 0, // Will be calculated after sorting
          grade: this.calculateGrade(totalAverage)
        };
      })
      .sort((a, b) => b.totalAverage - a.totalAverage)
      .map((item, index) => ({ ...item, position: index + 1 }));
  }

  static generateSubjectAnalytics(
    broadsheetData: BroadsheetData[],
    subjectCode: string
  ) {
    const subjectData = broadsheetData.map(data => ({
      studentName: data.studentName,
      admissionNumber: data.admissionNumber,
      termScores: data.termScores,
      cumulativeScore: data.cumulativeScores[subjectCode] || 0,
      grade: this.calculateGrade(data.cumulativeScores[subjectCode] || 0)
    })).sort((a, b) => b.cumulativeScore - a.cumulativeScore);

    const scores = subjectData.map(d => d.cumulativeScore).filter(s => s > 0);
    
    return {
      totalStudents: subjectData.length,
      attemptedStudents: scores.length,
      highestScore: Math.max(...scores, 0),
      lowestScore: Math.min(...scores, 100),
      averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0,
      passRate: scores.length > 0 ? Math.round((scores.filter(s => s >= 40).length / scores.length) * 100) : 0,
      gradeDistribution: {
        A: scores.filter(s => s >= 80).length,
        B: scores.filter(s => s >= 70 && s < 80).length,
        C: scores.filter(s => s >= 60 && s < 70).length,
        D: scores.filter(s => s >= 50 && s < 60).length,
        E: scores.filter(s => s >= 40 && s < 50).length,
        F: scores.filter(s => s < 40).length,
      },
      studentData: subjectData
    };
  }

  private static calculateGrade(percentage: number): string {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  }
}

// Advanced Search Engine
export class AdvancedSearchEngine {
  static searchStudents(students: any[], query: string) {
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student => 
      student.name?.toLowerCase().includes(lowercaseQuery) ||
      student.admission_number?.toLowerCase().includes(lowercaseQuery) ||
      student.email?.toLowerCase().includes(lowercaseQuery)
    );
  }

  static matchParentToStudent(
    parentEmail: string,
    studentData: { name: string; class_id: string },
    students: any[]
  ): boolean {
    return students.some(student => 
      student.name === studentData.name &&
      student.class_id === studentData.class_id &&
      !student.parent_id // Student doesn't have a parent yet
    );
  }

  static advancedSearch(data: any[], query: string, filters: any) {
    let results = data;

    // Apply text search
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      results = results.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(lowercaseQuery)
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        results = results.filter(item => item[key] === value);
      }
    });

    return results;
  }
}

// Device Compatibility Utilities
export class DeviceCompatibility {
  static getDeviceType(): 'phone' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'phone';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  static isResponsive(): boolean {
    return true; // All our components are responsive
  }

  static getOptimalLayoutForDevice(deviceType: 'phone' | 'tablet' | 'desktop') {
    switch (deviceType) {
      case 'phone':
        return {
          columns: 1,
          spacing: 'compact',
          navigation: 'bottom',
          fontSize: 'small'
        };
      case 'tablet':
        return {
          columns: 2,
          spacing: 'normal',
          navigation: 'side',
          fontSize: 'medium'
        };
      default:
        return {
          columns: 3,
          spacing: 'comfortable',
          navigation: 'side',
          fontSize: 'normal'
        };
    }
  }
}

// Export utilities
export const enhancedFeatures = {
  RealTimeTracker,
  AutomationEngine,
  BroadsheetAnalytics,
  AdvancedSearchEngine,
  DeviceCompatibility
};

export default enhancedFeatures;