"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PET_CATEGORIES, PET_IMAGES } from "@/lib/constants/pets";

interface ChoosePetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onPetSelected: (pet?: any) => void;
}

export function ChoosePetDialog({ open, onOpenChange, studentId, studentName, onPetSelected }: ChoosePetDialogProps) {
  const [selectedPet, setSelectedPet] = useState<{name: string, imageUrl: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleSelect = async () => {
    if (!selectedPet) {
      toast.error("请选择一个守护宠物");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          name: selectedPet.name,
          image: selectedPet.imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "选择宠物失败";
        try {
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `请求失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      toast.success("守护宠物选择成功！");
      onPetSelected(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to choose pet:", error);
      toast.error(error instanceof Error ? error.message : "选择宠物失败");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedPet(null);
      setSelectedCategory("all");
    }
    onOpenChange(isOpen);
  };

  const filteredPets = selectedCategory === "all" 
    ? PET_IMAGES 
    : PET_IMAGES.filter(p => p.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>为 {studentName} 选择守护宠物</DialogTitle>
          <DialogDescription>
            请从下方列表中选择一个作为该学生的守护宠物。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 overflow-x-auto pb-2 border-b my-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="whitespace-nowrap"
          >
            全部 ({PET_IMAGES.length})
          </Button>
          {PET_CATEGORIES.map((cat) => {
            const count = PET_IMAGES.filter(p => p.category === cat.id).length;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.emoji} {cat.name}({count})
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4">
          {filteredPets.map((pet, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer transition-all border-2 ${
                selectedPet?.name === pet.name
                  ? "border-primary bg-primary/10 scale-105 shadow-md"
                  : "border-transparent hover:border-primary/30 hover:bg-slate-50"
              }`}
              onClick={() => setSelectedPet(pet)}
            >
              <div className="h-16 w-16 mb-2 flex items-center justify-center">
                <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-contain drop-shadow-sm" />
              </div>
              <span className="text-xs text-center font-medium text-slate-700">
                {pet.name}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSelect} disabled={!selectedPet || loading}>
            {loading ? "提交中..." : "确定选择"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
