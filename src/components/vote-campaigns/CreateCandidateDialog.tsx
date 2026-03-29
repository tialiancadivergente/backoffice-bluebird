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
  slug: z.string().trim().min(1, "Slug é obrigatório"),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  image_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  category_id: z.string().min(1, "Categoria é obrigatória"),
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
    defaultValues: { name: "", slug: "", description: "", image_url: "", category_id: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: Values) => createCandidate(campaignId, {
      name: values.name,
      slug: values.slug,
      description: values.description,
      image_url: values.image_url || undefined,
      category_id: values.category_id,
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
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="João Silva" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="joao-silva" {...field} /></FormControl><FormMessage /></FormItem>
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
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descrição do candidato" rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="image_url" render={({ field }) => (
              <FormItem><FormLabel>URL da Imagem (opcional)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
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
