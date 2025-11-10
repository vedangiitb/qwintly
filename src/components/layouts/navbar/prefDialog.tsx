import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

export default function PrefDialog() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className="flex items-center cursor-pointer p-2 hover:bg-border transition-colors duration-300 rounded-md">
            <Settings2 className="h-4 w-4 mr-2" />
            <p className="text-sm">Preferences</p>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Preferences</DialogTitle>
            <DialogDescription>
              Comming Soon...
            </DialogDescription>
          </DialogHeader>
          {/* <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter> */}
        </DialogContent>
      </form>
    </Dialog>
  );
}
