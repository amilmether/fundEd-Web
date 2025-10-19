'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
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
import type { QrCode } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export default function SettingsPage() {
  const firestore = useFirestore();
  const storage = firestore ? getStorage(firestore.app) : null;
  const { toast } = useToast();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';

  const qrCodesCollection = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/qrcodes`) : null, [firestore, classId]);
  const { data: qrCodes, isLoading } = useCollection<QrCode>(qrCodesCollection);

  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newQrName, setNewQrName] = useState('');
  const [newQrFile, setNewQrFile] = useState<File | null>(null);

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, `classes/${classId}/qrcodes`, id));
    toast({ title: 'QR Code Deleted' });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setNewQrFile(e.target.files[0]);
    }
  };

  const handleAddQrCode = async () => {
    if (!newQrName || !newQrFile || !storage || !firestore) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a name and select a file."
        });
        return;
    }
    setIsUploading(true);

    try {
        const storageRef = ref(storage, `qr_codes/${Date.now()}_${newQrFile.name}`);
        const snapshot = await uploadBytes(storageRef, newQrFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const qrCodeData: Omit<QrCode, 'id'> = {
            name: newQrName,
            url: downloadURL,
        };

        await addDocumentNonBlocking(collection(firestore, `classes/${classId}/qrcodes`), qrCodeData);

        toast({
            title: "QR Code Added",
            description: "Your new QR code has been saved."
        });

        setNewQrName('');
        setNewQrFile(null);
        setOpen(false);

    } catch (error) {
        console.error("Error uploading QR code:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was an error uploading your QR code."
        });
    } finally {
        setIsUploading(false);
    }
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your personal settings and preferences.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Manage QR Codes</CardTitle>
            <CardDescription>
              Add, view, or remove your payment QR codes.
            </CardDescription>
          </div>
           <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New QR
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New QR Code</DialogTitle>
                <DialogDescription>
                  Upload a new QR code image and give it a name.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="qr-name">QR Code Name</Label>
                  <Input id="qr-name" placeholder="e.g., GPay Business" value={newQrName} onChange={(e) => setNewQrName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                   <Label htmlFor="qr-code">QR Code Image</Label>
                   <Input id="qr-code" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isUploading}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddQrCode} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save QR Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading && <p>Loading QR codes...</p>}
            {qrCodes?.map(qr => (
              <Card key={qr.id}>
                <CardContent className="p-4 flex flex-col items-center justify-center gap-4">
                   <Image
                      src={qr.url}
                      alt={qr.name}
                      width={150}
                      height={150}
                      className="rounded-lg border"
                    />
                    <p className="font-medium text-center">{qr.name}</p>
                </CardContent>
                <CardFooter className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => handleDelete(qr.id)}
                    >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
             {qrCodes?.length === 0 && !isLoading && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    You haven't added any QR codes yet.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
