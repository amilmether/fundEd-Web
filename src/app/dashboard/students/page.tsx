'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Upload, MoreHorizontal, PlusCircle, Download, FileQuestion, Loader2, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Papa from 'papaparse';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function StudentsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [uploadCsvOpen, setUploadCsvOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const { toast } = useToast();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';

  const studentsCollection = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/students`) : null, [firestore, classId]);
  const { data: students, isLoading } = useCollection<Student>(studentsCollection);

  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const rollNo = formData.get('rollNo') as string;
    const email = formData.get('email') as string;
    const studentClass = formData.get('class') as string;

    const studentData: Omit<Student, 'id'> = {
      name,
      rollNo,
      email,
      class: studentClass,
    };
    
    addDocumentNonBlocking(collection(firestore, `classes/${classId}/students`), studentData);
    toast({ title: 'Student Added' });

    setAddStudentOpen(false);
  }

  const handleDownloadTemplate = () => {
    const csvContent = "rollNo,name,email,class\nA-01,John Doe,john.doe@example.com,SE-A\nA-02,Jane Smith,jane.smith@example.com,SE-A";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "students-template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !firestore) return;
    
    setIsUploading(true);

    Papa.parse<Omit<Student, 'id'>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const existingRollNos = new Set(students?.map(s => s.rollNo));
        const newStudents = results.data.filter(s => {
          const rollNo = s.rollNo?.trim();
          if (!rollNo) return false;
          if (existingRollNos.has(rollNo)) return false;
          existingRollNos.add(rollNo); // Add to set to handle duplicates within the CSV itself
          return true;
        });

        const duplicatesCount = results.data.length - newStudents.length;

        if (newStudents.length > 0) {
            try {
                const batch = writeBatch(firestore);
                const studentsRef = collection(firestore, `classes/${classId}/students`);
                
                newStudents.forEach(student => {
                    const docRef = doc(studentsRef);
                    batch.set(docRef, student);
                });

                await batch.commit();

                 toast({
                    title: 'Upload Successful',
                    description: `${newStudents.length} students were added. ${duplicatesCount} duplicate(s) were skipped.`,
                });
            } catch(e) {
                 toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: 'There was an error saving the student data.',
                });
                console.error(e)
            }
        } else {
             toast({
                title: 'No New Students Added',
                description: 'All students in the file were duplicates or the file was empty.',
            });
        }
        
        setIsUploading(false);
        setUploadCsvOpen(false);
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not parse the CSV file. Please check its format.',
        });
        setIsUploading(false);
      }
    });
  }

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteStudent = () => {
    if (!firestore || !studentToDelete) return;
    const studentRef = doc(firestore, `classes/${classId}/students`, studentToDelete.id);
    deleteDocumentNonBlocking(studentRef);
    toast({ title: 'Student Deleted', description: `${studentToDelete.name} has been removed.` });
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
    setDeleteConfirmation('');
  };


  return (
    <>
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <CardTitle>Students</CardTitle>
          <CardDescription>
            Manage student information and track their participation.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search by name or roll no..." 
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
             />
          <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSaveStudent}>
                    <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to add a new student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rollNo" className="text-right">
                                Roll No.
                            </Label>
                            <Input id="rollNo" name="rollNo" placeholder="e.g., A-15" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" name="name" placeholder="e.g., John Doe" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input id="email" name="email" type="email" placeholder="e.g., john@example.com" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="class" className="text-right">
                                Class
                            </Label>
                            <Input id="class" name="class" placeholder="e.g., SE-A" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Save Student
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadCsvOpen} onOpenChange={setUploadCsvOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" /> 
                    <span className="whitespace-nowrap">Upload CSV</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Students via CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add multiple students at once. Duplicates will be skipped based on Roll No.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
                        <h4 className="font-semibold flex items-center gap-2"><FileQuestion className="h-4 w-4"/>File Format</h4>
                        <p>Your CSV file must contain the headers: <code className="font-mono bg-muted px-1 py-0.5 rounded">rollNo</code>, <code className="font-mono bg-muted px-1 py-0.5 rounded">name</code>, <code className="font-mono bg-muted px-1 py-0.5 rounded">email</code>, and <code className="font-mono bg-muted px-1 py-0.5 rounded">class</code>.</p>
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleDownloadTemplate}>
                            <Download className="mr-2 h-3 w-3" />
                            Download template file
                        </Button>
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="csv-file">CSV File</Label>
                        <Input id="csv-file" type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary" disabled={isUploading}>Cancel</Button>
                    </DialogClose>
                     <Button disabled={true} className="hidden">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Upload and Process
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Loading students...</p> : (
            <>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
              {filteredStudents?.map((student) => (
                <Card key={student.id}>
                   <CardHeader>
                     <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.rollNo} • {student.class}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${student.id}/payments`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Payments
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(student)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop View */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono font-medium font-code">{student.rollNo}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                           <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${student.id}/payments`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Payments
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(student)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            student <span className="font-semibold text-foreground">{studentToDelete?.name}</span> and all associated data.
            To confirm, please type <strong className="text-foreground">delete</strong> below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="delete"
          className="my-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteStudent}
            disabled={deleteConfirmation !== 'delete'}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Student
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
