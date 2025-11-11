"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOrg } from "../hooks/useOrg";

export default function NewOrgDialog() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { addOrganization } = useOrg();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    try {
      setLoading(true);
      await addOrganization(orgName);
      setOrgName("");
      setOpen(false); // ✅ close dialog
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🔹 Trigger Button */}
      <DialogTrigger asChild>
        <div className="flex gap-2">
          <Button className="gap-2 rounded-lg cursor-pointer">
            <Plus className="w-4 h-4" />
            Create Organization
          </Button>
        </div>
      </DialogTrigger>

      {/* 🔹 Dialog Content */}
      <DialogContent className="sm:max-w-md rounded-xl bg-background/80 backdrop-blur-md border border-white/10 shadow-lg">
        <DialogHeader>
          <DialogTitle>Create a New Organization</DialogTitle>
          <DialogDescription>
            Enter a name for your new organization to get started.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full font-medium"
                disabled={loading || !orgName.trim()}
              >
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
