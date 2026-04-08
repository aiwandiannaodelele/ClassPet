"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Loader2, History, ShoppingBag, ChevronLeft, 
  Search, Coins, Calendar, User, LayoutGrid, Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
  stock: number;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  coins: number;
  score: number;
  pet?: {
    image?: string;
  } | null;
}

interface ExchangeRecord {
  id: string;
  product: {
    name: string;
    icon: string;
    price: number;
  };
  student: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface StoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
}

const productCategories = [
  { id: "food", name: "美食", icon: "🍔" },
  { id: "stationery", name: "文具", icon: "✏️" },
  { id: "entertainment", name: "娱乐", icon: "🎮" },
  { id: "privilege", name: "特权", icon: "⭐" },
  { id: "misc", name: "杂项", icon: "🎁" },
];

export function StoreDialog({ open, onOpenChange, classId }: StoreDialogProps) {
  const [storeTab, setStoreTab] = useState("products");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingExchanges, setLoadingExchanges] = useState(false);
  
  const [isExchanging, setIsExchanging] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchStudent, setSearchSearchStudent] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (open && classId) {
      fetchProducts();
      fetchExchanges();
      fetchStudents();
    }
  }, [open, classId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchExchanges = async () => {
    setLoadingExchanges(true);
    try {
      const response = await fetch(`/api/exchanges?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setExchanges(data);
      }
    } catch (error) {
      console.error("Failed to fetch exchanges:", error);
    } finally {
      setLoadingExchanges(false);
    }
  };

  const handleStartExchange = (product: Product) => {
    if (product.stock === 0) {
      toast.error("该商品库存不足");
      return;
    }
    setSelectedProduct(product);
    setIsExchanging(true);
    setSelectedStudentIds([]);
  };

  const handleConfirmExchange = async () => {
    if (!selectedProduct || selectedStudentIds.length === 0) return;

    setLoading(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const studentId of selectedStudentIds) {
        const student = students.find(s => s.id === studentId);
        if (!student || student.score < selectedProduct.price) {
          failCount++;
          continue;
        }

        const response = await fetch("/api/exchanges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId,
            studentId,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            price: selectedProduct.price,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`兑换成功！已为 ${successCount} 名学生兑换 ${selectedProduct.name}`);
        fetchProducts();
        fetchExchanges();
        fetchStudents();
        setIsExchanging(false);
        setSelectedProduct(null);
        
        // 触发全局学生列表刷新
        window.dispatchEvent(new Event('class-updated'));
        router.refresh();
      }
      
      if (failCount > 0) {
        toast.error(`${failCount} 名学生兑换失败`);
      }
    } catch (error) {
      console.error("Exchange error:", error);
      toast.error("兑换过程发生错误");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <Tabs value={storeTab} onValueChange={setStoreTab} className="flex-1 flex flex-col overflow-hidden">
            {!isExchanging ? (
              <>
                <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      宠物小商店
                    </DialogTitle>
                    <DialogDescription>
                      消耗宠物币，兑换奖励
                    </DialogDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowAddProduct(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加商品
                  </Button>
                </DialogHeader>

                <div className="mt-4 shrink-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products">商品列表</TabsTrigger>
                    <TabsTrigger value="exchanges">兑换记录</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="products" className="flex-1 h-full m-0 flex flex-col">
                    <div className="py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-b">
                      <Button 
                        variant={selectedCategory === "all" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedCategory("all")}
                      >
                        全部
                      </Button>
                      {productCategories.map(cat => (
                        <Button 
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          {cat.icon} {cat.name}
                        </Button>
                      ))}
                    </div>

                    <ScrollArea className="flex-1 pt-4">
                      {loading ? (
                        <div className="py-20 text-center text-muted-foreground">加载中...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">暂无商品</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 px-1">
                          {filteredProducts.map((product) => (
                            <Card key={product.id} className="shadow-sm">
                              <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                  <span className="text-4xl">{product.icon || "📦"}</span>
                                  <Badge variant="secondary">
                                    {productCategories.find(c => c.id === product.category)?.name || product.category}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-bold truncate">{product.name}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{product.description || "暂无描述"}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                                    <Coins className="w-4 h-4" />
                                    <span>{product.price}</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">库存: {product.stock === -1 ? "∞" : product.stock}</span>
                                </div>
                                <Button size="sm" className="w-full mt-1" onClick={() => handleStartExchange(product)}>
                                  兑换
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="exchanges" className="flex-1 h-full m-0 flex flex-col">
                    <ScrollArea className="flex-1 pt-4">
                      <div className="space-y-2 px-1">
                        {loadingExchanges ? (
                          <div className="py-20 text-center text-muted-foreground">加载记录中...</div>
                        ) : exchanges.length === 0 ? (
                          <div className="py-20 text-center text-muted-foreground">暂无记录</div>
                        ) : (
                          exchanges.map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{record.product?.icon || "🎁"}</span>
                                <div>
                                  <div className="text-sm font-bold">{record.product?.name}</div>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                    <span>{record.student?.name}</span>
                                    <span>•</span>
                                    <span>{format(new Date(record.createdAt), "MM-dd HH:mm", { locale: zhCN })}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-amber-600 font-bold text-sm">-{record.product?.price} 币</div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExchanging(false)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <DialogTitle className="text-lg font-bold">
                      给学生兑换: <span className="text-amber-600">{selectedProduct?.name}</span>
                    </DialogTitle>
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="搜索学生" 
                      className="pl-8 h-8 text-xs"
                      value={searchStudent}
                      onChange={(e) => setSearchSearchStudent(e.target.value)}
                    />
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredStudents.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const canAfford = student.score >= (selectedProduct?.price || 0);
                      
                      return (
                        <div 
                          key={student.id}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                            isSelected ? "border-primary bg-primary/5" : canAfford ? "hover:bg-slate-50" : "opacity-50 grayscale bg-slate-50 cursor-not-allowed"
                          }`}
                          onClick={() => canAfford && toggleStudent(student.id)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.pet?.image} />
                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-center min-w-0 w-full">
                            <div className="text-xs font-bold truncate">{student.name}</div>
                            <div className={`text-[10px] ${canAfford ? 'text-amber-600' : 'text-red-500'} font-medium`}>成长值: {student.score}</div>
                          </div>
                          {isSelected && <div className="absolute top-1 right-1"><Check className="w-3 h-3 text-primary" /></div>}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">已选 {selectedStudentIds.length} 人</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsExchanging(false)}>取消</Button>
                    <Button 
                      size="sm" 
                      disabled={selectedStudentIds.length === 0 || loading}
                      onClick={handleConfirmExchange}
                    >
                      {loading && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                      确认兑换
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <AddProductDialog 
        open={showAddProduct} 
        onOpenChange={setShowAddProduct} 
        classId={classId}
        onSuccess={fetchProducts}
      />
    </>
  );
}

function AddProductDialog({ open, onOpenChange, classId, onSuccess }: { open: boolean, onOpenChange: (o: boolean) => void, classId?: string, onSuccess: () => void }) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState(10);
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🍔");
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!productName.trim() || !classId) {
      toast.error("请输入商品名称");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: productName, 
          price, 
          stock, 
          description, 
          category: selectedCategory,
          icon: selectedIcon
        }),
      });
      if (response.ok) {
        toast.success("商品上架成功");
        onOpenChange(false);
        setProductName("");
        setPrice(10);
        setStock(10);
        setDescription("");
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.error || "上架失败");
      }
    } catch (error) {
      toast.error("网络请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>上架新商品</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>商品名称</Label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="如：免作业卡" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>价格</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label>库存</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>选择分类与图标</Label>
            <div className="flex gap-2 flex-wrap">
              {productCategories.map((cat) => (
                <Button 
                  key={cat.id} 
                  variant={selectedCategory === cat.id ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedIcon(cat.icon);
                  }}
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>描述 (选填)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简单介绍下商品..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            确认上架
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
