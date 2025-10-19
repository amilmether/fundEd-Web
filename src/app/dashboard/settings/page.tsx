
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
import { Upload, Trash2, PlusCircle } from 'lucide-react';
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

type QrCode = {
  id: string;
  name: string;
  url: string;
};

const initialQrCodes: QrCode[] = [
    { id: 'qr1', name: 'GPay Business', url: 'https://picsum.photos/seed/qr1/300/300' },
    { id: 'qr2', name: 'PhonePe Personal', url: 'https://picsum.photos/seed/qr2/300/300' },
];

export default function SettingsPage() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>(initialQrCodes);
  const [open, setOpen] = useState(false);

  const handleDelete = (id: string) => {
    setQrCodes(prev => prev.filter(qr => qr.id !== id));
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage QR Codes</CardTitle>
            <CardDescription>
              Add, view, or remove your payment QR codes.
            </CardDescription>
          </div>
           <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
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
                  <Input id="qr-name" placeholder="e.g., GPay Business" />
                </div>
                <div className="grid gap-2">
                   <Label htmlFor="qr-code">QR Code Image</Label>
                   <Input id="qr-code" type="file" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={() => setOpen(false)}>Save QR Code</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {qrCodes.map(qr => (
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
             {qrCodes.length === 0 && (
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
