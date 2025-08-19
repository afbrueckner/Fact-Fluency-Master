import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Download, 
  FileText,
  TrendingUp,
  Award,
  Clock,
  Target,
  Settings
} from "lucide-react";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { getAllStudents, addStudent, removeStudent, getCurrentStudentId, setCurrentStudentId } from "@/lib/localStorage";
import type { Student } from "@shared/schema";

interface StudentStats {
  totalPoints: number;
  averageAccuracy: number;
  averageEfficiency: number;
  averageFlexibility: number;
  averageStrategyUse: number;
  totalObservations: number;
  lastActive: Date | null;
  currentPhase: string;
  completedAssessments: number;
}

export default function Admin() {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    grade: 6,
    section: "A"
  });
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>("");

  const students = getAllStudents();

  const generateStudentId = (name: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `student-${cleanName}-${Date.now()}`;
  };

  const generateInitials = (name: string) => {
    return name.split(' ').map(word => word[0]?.toUpperCase() || '').join('').slice(0, 2);
  };

  const handleAddStudent = () => {
    if (!newStudentForm.name.trim()) return;
    
    const newStudent: Student = {
      id: generateStudentId(newStudentForm.name),
      name: newStudentForm.name.trim(),
      grade: newStudentForm.grade,
      section: newStudentForm.section,
      initials: generateInitials(newStudentForm.name.trim()),
      createdAt: new Date()
    };
    
    addStudent(newStudent);
    setNewStudentForm({ name: "", grade: 6, section: "A" });
  };

  const handleEditStudent = (student: Student) => {
    const updatedStudent = {
      ...student,
      initials: generateInitials(student.name)
    };
    addStudent(updatedStudent);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    removeStudent(studentId);
  };

  const getStudentStats = (studentId: string): StudentStats => {
    // Get scoped data for this student
    const getScopedKey = (baseKey: string, id: string) => `${baseKey}-${id}`;
    
    const getFromStorage = (key: string, defaultValue: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    };

    const progress = getFromStorage(getScopedKey('math-fluency-progress', studentId), []);
    const points = getFromStorage(getScopedKey('math-fluency-points', studentId), { totalPoints: 0 });
    const observations = getFromStorage(getScopedKey('math-fluency-observations', studentId), []);

    const avgAccuracy = progress.length > 0 ? progress.reduce((sum: number, p: any) => sum + p.accuracy, 0) / progress.length : 0;
    const avgEfficiency = progress.length > 0 ? progress.reduce((sum: number, p: any) => sum + p.efficiency, 0) / progress.length : 0;
    const avgFlexibility = progress.length > 0 ? progress.reduce((sum: number, p: any) => sum + p.flexibility, 0) / progress.length : 0;
    const avgStrategyUse = progress.length > 0 ? progress.reduce((sum: number, p: any) => sum + p.strategyUse, 0) / progress.length : 0;

    const lastActiveDate = progress.length > 0 
      ? new Date(Math.max(...progress.map((p: any) => new Date(p.lastPracticed).getTime())))
      : null;

    const masteringCount = progress.filter((p: any) => p.phase === 'mastery').length;
    const derivingCount = progress.filter((p: any) => p.phase === 'deriving').length;
    const countingCount = progress.filter((p: any) => p.phase === 'counting').length;
    
    let currentPhase = 'Beginning';
    if (masteringCount > derivingCount && masteringCount > countingCount) {
      currentPhase = 'Mastery';
    } else if (derivingCount > countingCount) {
      currentPhase = 'Deriving';
    } else if (countingCount > 0) {
      currentPhase = 'Counting';
    }

    return {
      totalPoints: points.totalPoints || 0,
      averageAccuracy: Math.round(avgAccuracy),
      averageEfficiency: Math.round(avgEfficiency),
      averageFlexibility: Math.round(avgFlexibility),
      averageStrategyUse: Math.round(avgStrategyUse),
      totalObservations: observations.length,
      lastActive: lastActiveDate,
      currentPhase,
      completedAssessments: observations.length
    };
  };

  const generateStudentReport = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const stats = getStudentStats(studentId);
    
    if (!student) return;

    const reportData = {
      student: student.name,
      grade: student.grade,
      section: student.section,
      reportDate: new Date().toLocaleDateString(),
      stats,
      recommendations: generateRecommendations(stats)
    };

    // Create downloadable report
    const reportText = `
Math Fact Fluency Progress Report
=====================================
Student: ${reportData.student}
Grade: ${reportData.grade}, Section: ${reportData.section}
Report Date: ${reportData.reportDate}

Performance Summary:
- Current Phase: ${stats.currentPhase}
- Average Accuracy: ${stats.averageAccuracy}%
- Average Efficiency: ${stats.averageEfficiency}%
- Average Flexibility: ${stats.averageFlexibility}%
- Average Strategy Use: ${stats.averageStrategyUse}%
- Total Points Earned: ${stats.totalPoints}
- Completed Assessments: ${stats.completedAssessments}
- Last Active: ${stats.lastActive?.toLocaleDateString() || 'Never'}

Recommendations:
${reportData.recommendations.join('\n')}

Bay-Williams & Kling Framework Analysis:
This report follows the research-based framework focusing on fluency components:
accuracy, efficiency, flexibility, and appropriate strategy use.
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name.replace(/\s+/g, '_')}_Progress_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = (stats: StudentStats): string[] => {
    const recommendations = [];

    if (stats.averageAccuracy < 70) {
      recommendations.push("- Focus on foundational fact practice to improve accuracy");
    }
    if (stats.averageEfficiency < 60) {
      recommendations.push("- Provide more timed practice sessions to build efficiency");
    }
    if (stats.averageFlexibility < 50) {
      recommendations.push("- Introduce multiple strategy approaches for the same fact families");
    }
    if (stats.averageStrategyUse < 60) {
      recommendations.push("- Encourage explicit strategy discussion and reasoning");
    }
    if (stats.currentPhase === 'Counting') {
      recommendations.push("- Continue with foundational counting strategies before moving to derived facts");
    }
    if (stats.totalObservations < 3) {
      recommendations.push("- Increase observation sessions to better track progress");
    }

    if (recommendations.length === 0) {
      recommendations.push("- Student is performing well across all fluency components");
      recommendations.push("- Continue current practice routine and consider advanced fact families");
    }

    return recommendations;
  };

  const exportAllData = () => {
    const allData = {
      students,
      exportDate: new Date().toISOString(),
      studentsData: students.map(student => ({
        student,
        stats: getStudentStats(student.id)
      }))
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Math_Fluency_Class_Data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Teacher Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage students, view progress reports, and analyze learning data</p>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="reports">Progress Reports</TabsTrigger>
            <TabsTrigger value="analytics">Class Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Student Profiles ({students.length})</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add New Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Student Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter student name"
                        value={newStudentForm.name}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Select
                          value={newStudentForm.grade.toString()}
                          onValueChange={(value) => setNewStudentForm(prev => ({ ...prev, grade: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="section">Section</Label>
                        <Select
                          value={newStudentForm.section}
                          onValueChange={(value) => setNewStudentForm(prev => ({ ...prev, section: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['A', 'B', 'C', 'D', 'E'].map(section => (
                              <SelectItem key={section} value={section}>
                                Section {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddStudent}
                      className="w-full"
                      disabled={!newStudentForm.name.trim()}
                    >
                      Add Student
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map(student => {
                const stats = getStudentStats(student.id);
                return (
                  <Card key={student.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{student.name}</CardTitle>
                          <p className="text-sm text-gray-500">Grade {student.grade} • Section {student.section}</p>
                        </div>
                        <Badge variant="secondary">{student.initials}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-yellow-500" />
                          <span>{stats.totalPoints} pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-green-500" />
                          <span>{stats.averageAccuracy}% acc</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-blue-500" />
                          <span>{stats.currentPhase}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span>{stats.totalObservations} obs</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingStudent(student)}
                              className="flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Student</DialogTitle>
                            </DialogHeader>
                            {editingStudent && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Student Name</Label>
                                  <Input
                                    value={editingStudent.name}
                                    onChange={(e) => setEditingStudent(prev => 
                                      prev ? { ...prev, name: e.target.value } : null
                                    )}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Grade</Label>
                                    <Select
                                      value={editingStudent.grade.toString()}
                                      onValueChange={(value) => setEditingStudent(prev => 
                                        prev ? { ...prev, grade: parseInt(value) } : null
                                      )}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                                          <SelectItem key={grade} value={grade.toString()}>
                                            Grade {grade}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Section</Label>
                                    <Select
                                      value={editingStudent.section}
                                      onValueChange={(value) => setEditingStudent(prev => 
                                        prev ? { ...prev, section: value } : null
                                      )}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {['A', 'B', 'C', 'D', 'E'].map(section => (
                                          <SelectItem key={section} value={section}>
                                            Section {section}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => handleEditStudent(editingStudent)}
                                  className="w-full"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {student.name}'s profile and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudent(student.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Student Progress Reports</h2>
              <Button onClick={exportAllData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate Individual Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Select Student</Label>
                    <Select value={selectedStudentForReport} onValueChange={setSelectedStudentForReport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} (Grade {student.grade}, Section {student.section})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => generateStudentReport(selectedStudentForReport)}
                    disabled={!selectedStudentForReport}
                    className="flex items-center gap-2 mt-6"
                  >
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map(student => {
                const stats = getStudentStats(student.id);
                return (
                  <Card key={student.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Phase:</span>
                          <Badge variant="outline">{stats.currentPhase}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-medium">{stats.averageAccuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <span className="font-medium">{stats.averageEfficiency}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flexibility:</span>
                          <span className="font-medium">{stats.averageFlexibility}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Strategy Use:</span>
                          <span className="font-medium">{stats.averageStrategyUse}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Active:</span>
                          <span className="text-gray-600">
                            {stats.lastActive ? stats.lastActive.toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => generateStudentReport(student.id)}
                        className="w-full mt-4 flex items-center gap-2"
                        variant="outline"
                      >
                        <Download className="h-3 w-3" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Class Analytics</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Class Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.length > 0 
                      ? Math.round(students.reduce((sum, student) => sum + getStudentStats(student.id).averageAccuracy, 0) / students.length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Students in Mastery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.filter(student => getStudentStats(student.id).currentPhase === 'Mastery').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Points Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.reduce((sum, student) => sum + getStudentStats(student.id).totalPoints, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Class Progress Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Counting', 'Deriving', 'Mastery'].map(phase => {
                    const count = students.filter(student => getStudentStats(student.id).currentPhase === phase).length;
                    const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                    
                    return (
                      <div key={phase} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">{phase}:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 w-12">{count} ({Math.round(percentage)}%)</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}