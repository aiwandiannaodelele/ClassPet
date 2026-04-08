"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess: () => void;
}

export function BatchImportDialog({ open, onOpenChange, classId, onSuccess }: BatchImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<{ name: string; studentNo: string }[]>([]);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextParse = () => {
    if (!textInput.trim()) {
      toast.error("请输入学生信息");
      return;
    }

    const lines = textInput.split('\n');
    const data: { name: string; studentNo: string }[] = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      // Support comma, space, or tab separated values
      const parts = line.split(/[, \t]+/).filter(Boolean);
      if (parts.length >= 1) {
        data.push({
          name: parts[0],
          studentNo: parts.length > 1 ? parts[1] : ''
        });
      }
    }
    
    if (data.length === 0) {
      toast.error("未能识别出有效的学生信息，请检查格式。");
    } else {
      setParsedData(data);
      toast.success(`成功识别 ${data.length} 条数据，请在预览中确认。`);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF姓名,学号\n张三,2023001\n李四,2023002";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "学生导入模板.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parser
      const lines = text.split('\n');
      const data: { name: string; studentNo: string }[] = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length >= 1) {
          data.push({
            name: parts[0].trim(),
            studentNo: parts.length > 1 ? parts[1].trim() : ''
          });
        }
      }
      
      if (data.length === 0) {
        toast.error("未能从文件中读取到有效数据，请检查格式。");
      } else {
        setParsedData(data);
      }
    };
    // 尝试使用 gbk 编码读取，解决 Windows Excel 导出的 CSV 中文乱码问题
    reader.readAsText(file, 'gbk');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/students/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: parsedData }),
      });

      if (!response.ok) {
        throw new Error("批量导入失败");
      }

      toast.success(`成功导入 ${parsedData.length} 名学生！`);
      setParsedData([]);
      setTextInput("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("导入失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    setTextInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>批量导入学生</DialogTitle>
          <DialogDescription>
            支持文本框直接输入或上传 CSV 文件来快速添加多个学生。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">文本输入</TabsTrigger>
              <TabsTrigger value="file">文件上传</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Textarea 
                  placeholder="每行一个学生，格式：姓名 学号（学号可选，支持空格、逗号或制表符分隔）&#10;例如：&#10;张三 2023001&#10;李四&#10;王五,2023003" 
                  className="min-h-[150px] resize-y"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>
              <Button onClick={handleTextParse} variant="secondary" className="w-full">
                解析数据
              </Button>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="flex gap-4">
                <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  下载 CSV 模板
                </Button>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  上传 CSV 文件
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p>提示：请确保 CSV 文件包含「姓名」和「学号」两列，首行为表头。</p>
              </div>
            </TabsContent>
          </Tabs>

          {parsedData.length > 0 && (
            <div className="border rounded-md">
              <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
                <span className="font-medium">预览数据 (共 {parsedData.length} 条)</span>
                <Button variant="ghost" size="sm" onClick={() => setParsedData([])}>清空</Button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>学号</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.studentNo || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={parsedData.length === 0 || loading}>
            {loading ? "导入中..." : `确认导入 ${parsedData.length > 0 ? `(${parsedData.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
