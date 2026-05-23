import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createHotmartProduct,
  updateHotmartProduct,
  deleteHotmartProduct,
} from "@/api/hotmart";
import { useHotmartProducts } from "@/hooks/use-hotmart";
import { useLaunchOptions } from "@/hooks/use-launch-dashboard";
import type { HotmartProduct } from "@/types/hotmart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  product_id: z
    .string()
    .trim()
    .min(1, "ID é obrigatório")
    .refine((v) => /^\d+$/.test(v), "Deve ser um número inteiro"),
  launch_id: z.string().optional(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

function ProductForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: {
  defaultValues: FormValues;
  onSubmit: (v: FormValues) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  const launchesQuery = useLaunchOptions();
  const launches = launchesQuery.data ?? [];

  const [name, setName] = useState(defaultValues.name);
  const [productId, setProductId] = useState(defaultValues.product_id);
  const [launchId, setLaunchId] = useState<string | undefined>(defaultValues.launch_id);
  const [active, setActive] = useState(defaultValues.active);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = formSchema.safeParse({ name, product_id: productId, launch_id: launchId, active });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({ name: flat.name?.[0], product_id: flat.product_id?.[0] });
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do produto</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: PONTO CEGO - Evento Online"
        />
        {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label>ID do produto Hotmart</Label>
        <Input
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="ex: 12345678"
          inputMode="numeric"
        />
        {errors.product_id && <p className="text-sm font-medium text-destructive">{errors.product_id}</p>}
      </div>

      <div className="space-y-2">
        <Label>
          Launch <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <UiSelect
          value={launchId ?? "none"}
          onValueChange={(v) => setLaunchId(v === "none" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nenhum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {launches.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </UiSelect>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label>Ativo</Label>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function HotmartProductConfig() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useHotmartProducts();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HotmartProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HotmartProduct | null>(null);

  const createMutation = useMutation({
    mutationFn: createHotmartProduct,
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      queryClient.refetchQueries({ queryKey: ["hotmart-products"] });
      setCreateOpen(false);
    },
    onError: () => toast.error("Erro ao criar produto."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateHotmartProduct>[1] }) =>
      updateHotmartProduct(id, payload),
    onSuccess: (updated) => {
      toast.success("Produto atualizado com sucesso!");
      queryClient.setQueryData<HotmartProduct[]>(["hotmart-products"], (old) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
      );
      setEditTarget(null);
    },
    onError: () => toast.error("Erro ao atualizar produto."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHotmartProduct,
    onSuccess: () => {
      toast.success("Produto removido.");
      queryClient.refetchQueries({ queryKey: ["hotmart-products"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao remover produto."),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Vincule produtos do Hotmart aos lançamentos para rastrear vendas no dashboard.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Produto
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Launch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && (products ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                  Nenhum produto configurado. Clique em "Novo Produto" para começar.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              (products ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{p.product_id}</TableCell>
                  <TableCell>{p.launch_name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "secondary"}>
                      {p.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditTarget(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Novo Produto Hotmart</DialogTitle>
          </DialogHeader>
          <ProductForm
            defaultValues={{ name: "", product_id: "", launch_id: undefined, active: true }}
            onSubmit={(v) =>
              createMutation.mutate({
                name: v.name,
                product_id: Number(v.product_id),
                launch_id: v.launch_id ?? null,
                active: v.active,
              })
            }
            isPending={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            submitLabel="Criar"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Editar Produto Hotmart</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <ProductForm
              key={editTarget.id}
              defaultValues={{
                name: editTarget.name,
                product_id: String(editTarget.product_id),
                launch_id: editTarget.launch_id ?? undefined,
                active: editTarget.active,
              }}
              onSubmit={(v) =>
                updateMutation.mutate({
                  id: editTarget.id,
                  payload: {
                    name: v.name,
                    product_id: Number(v.product_id),
                    launch_id: v.launch_id ?? null,
                    active: v.active,
                  },
                })
              }
              isPending={updateMutation.isPending}
              onCancel={() => setEditTarget(null)}
              submitLabel="Salvar"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove "{deleteTarget?.name}" (ID: {deleteTarget?.product_id}) da configuração.
              As vendas históricas na Hotmart não são afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
