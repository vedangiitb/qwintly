import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Settings } from "lucide-react";

export default function SettingsDialog() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className="flex items-center cursor-pointer p-2 hover:bg-border transition-colors duration-300 rounded-md">
            <Settings className="h-4 w-4 mr-2" />
            <p className="text-sm">Settings</p>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex justify-between border-b py-4">
              <p>Model</p>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex gap-2 hover:bg-accent py-1 px-2 rounded-md">
                  <p className="text-sm">Gemini</p>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Gemini 2.5 flash</DropdownMenuLabel>
                  <DropdownMenuItem>GPT 4o</DropdownMenuItem>
                  <DropdownMenuItem>GPT 4.1</DropdownMenuItem>
                  <DropdownMenuItem>o3-mini</DropdownMenuItem>
                  <DropdownMenuItem>Gemini 2.0 flash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
