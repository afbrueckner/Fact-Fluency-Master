import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Users, Star } from "lucide-react";
import { getAllStudents, addStudent, removeStudent, getCurrentStudentId, setCurrentStudentId } from "@/lib/localStorage";
import type { Student } from "@shared/schema";

export function UserSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    grade: 6,
    section: "A"
  });
  
  const currentStudentId = getCurrentStudentId();
  const allStudents = getAllStudents();
  const currentStudent = allStudents.find(s => s.id === currentStudentId);

  const handleSwitchUser = (studentId: string) => {
    setCurrentStudentId(studentId);
    setIsOpen(false);
    window.location.reload(); // Refresh to load new user's data
  };

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
    setCurrentStudentId(newStudent.id);
    setNewStudentForm({ name: "", grade: 6, section: "A" });
    setShowNewStudentForm(false);
    setIsOpen(false);
    window.location.reload(); // Refresh to load new user's data
  };

  const handleRemoveStudent = (studentId: string) => {
    if (allStudents.length <= 1) return; // Don't remove the last student
    removeStudent(studentId);
    if (studentId === currentStudentId && allStudents.length > 1) {
      const remainingStudents = allStudents.filter(s => s.id !== studentId);
      setCurrentStudentId(remainingStudents[0].id);
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">{currentStudent?.name || 'Switch User'}</span>
          <span className="sm:hidden">{currentStudent?.initials || 'SU'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Profiles
          </DialogTitle>
        </DialogHeader>

        {!showNewStudentForm ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Current Students</h4>
              <div className="space-y-2">
                {allStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      student.id === currentStudentId
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                        {student.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.name}</span>
                          {student.id === currentStudentId && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">Grade {student.grade}, Section {student.section}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {student.id !== currentStudentId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSwitchUser(student.id)}
                          className="text-xs"
                        >
                          Switch
                        </Button>
                      )}
                      {allStudents.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowNewStudentForm(true)}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <UserPlus className="h-4 w-4" />
                Add New Student
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Create New Student Profile</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Student Name
                </label>
                <Input
                  placeholder="Enter student name"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Grade
                  </label>
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
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Section
                  </label>
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
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddStudent}
                className="flex-1"
                disabled={!newStudentForm.name.trim()}
              >
                Create Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewStudentForm(false);
                  setNewStudentForm({ name: "", grade: 6, section: "A" });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}