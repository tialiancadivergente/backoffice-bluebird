import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCandidate, type VoteCategory } from "@/api/vote-campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  story_text: z.string().trim().min(1, "Texto da história é obrigatório"),
  photo_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  display_order: z.coerce.number().int().min(0, "Ordem deve ser >= 0"),
  active: z.boolean(),
});

type Values = z.infer<typeof schema>;

interface Props {
  campaignId: string;
  categories: VoteCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCandidateDialog({ campaignId, categories, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", story_text: "", photo_url: "", category_id: "", display_order: 0, active: true },
  });

  const mutation = useMutation({
    mutationFn: (values: Values) => createCandidate(campaignId, {
      name: values.name,
      story_text: values.story_text,
      photo_url: values.photo_url || undefined,
      category_id: values.category_id,
      display_order: values.display_order,
      active: values.active,
    }),
    onSuccess: () => {
      toast.success("Candidato criado!");
      queryClient.invalidateQueries({ queryKey: ["vote-campaign-candidates", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["vote-campaign", campaignId] });
      form.reset();
      onOpenChange(false);
    },
    onError: () => toast.error("Erro ao criar candidato."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader><DialogTitle>Novo Candidato</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Fernanda Silva" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="story_text" render={({ field }) => (
              <FormItem><FormLabel>Texto da História</FormLabel><FormControl><Textarea placeholder="Conte a história do candidato..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="photo_url" render={({ field }) => (
              <FormItem><FormLabel>URL da Foto (opcional)</FormLabel><FormControl><Input placeholder="https://cdn.site.com/foto.jpg" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="display_order" render={({ field }) => (
                <FormItem><FormLabel>Ordem de Exibição</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ativo</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
