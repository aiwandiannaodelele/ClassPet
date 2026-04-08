"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Pet {
  id: string;
  name: string;
  image: string;
}

interface PetSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string;
  studentName: string;
  onSelect?: (pet: Pet) => void;
}

export function PetSelectorDialog({ open, onOpenChange, studentId, studentName, onSelect }: PetSelectorDialogProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPets();
    }
  }, [open]);

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/pets");
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      }
    } catch (error) {
      console.error("Failed to fetch pets:", error);
    }
  };

  const handleSelect = async (pet: Pet) => {
    if (!studentId) {
      toast.error("学生 ID 不存在");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          petId: pet.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "选择宠物失败");
      }

      toast.success(`${studentName} 选择了 ${pet.name}！`);
      onSelect?.(pet);
    } catch (error) {
      console.error("Failed to select pet:", error);
      toast.error("选择宠物失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🐾</span>
            为 {studentName} 选择守护宠物
          </DialogTitle>
          <DialogDescription>
            选择一只可爱的宠物，它会陪伴你一起成长！
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {pets.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {pets.map((pet) => (
                <Card
                  key={pet.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary disabled:opacity-50"
                  onClick={() => handleSelect(pet)}
                >
                  <CardContent className="pt-6 pb-6 flex flex-col items-center gap-2">
                    <div className="text-6xl mb-2">{pet.image}</div>
                    <span className="text-sm font-medium">{pet.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
