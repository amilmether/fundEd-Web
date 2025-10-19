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
import { Upload, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { useState } from 'react';

export default function StudentsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';

  const studentsCollection = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/students`) : null, [firestore, classId]);
  const { data: students, isLoading } = useCollection<Student>(studentsCollection);

  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
          <Button variant="outline" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" /> 
            <span className="whitespace-nowrap">Upload CSV</span>
          </Button>
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
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Payments</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Payments</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
  );
}
