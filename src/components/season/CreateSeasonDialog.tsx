import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSeason } from "@/api/season";
import { useLaunches } from "@/hooks/use-launches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(200),
  active: z.boolean(),
  launch_id: z.string().min(1, "Launch é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSeasonDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { data: launches, isLoading: launchesLoading } = useLaunches();
  const launchItems = Array.isArray(launches) ? launches : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", active: true, launch_id: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createSeason({ name: values.name, active: values.active, launch_id: values.launch_id }),
    onSuccess: () => {
      toast.success("Season criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao criar a season.");
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Nova Season</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Abr26" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="launch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Launch</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={launchesLoading ? "Carregando..." : "Selecione um launch"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {launchItems.map((launch) => (
                        <SelectItem key={launch.id} value={launch.id}>
                          {launch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="mb-0">Ativo</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Season
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
