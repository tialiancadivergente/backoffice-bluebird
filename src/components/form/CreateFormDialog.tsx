import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createForm } from "@/api/form";
import { useLaunches } from "@/hooks/use-launches";
import { useSeasons } from "@/hooks/use-seasons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type: z.string().min(1, "Tipo é obrigatório"),
  launch_id: z.string().min(1, "Launch é obrigatório"),
  season_id: z.string().min(1, "Season é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

const formTypes = [
  { value: "quiz", label: "Quiz" },
  { value: "survey", label: "Survey" },
  { value: "registration", label: "Registration" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { data: launches, isLoading: launchesLoading } = useLaunches();
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  const launchItems = Array.isArray(launches) ? launches : [];
  const seasonItems = Array.isArray(seasons) ? seasons : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", type: "", launch_id: "", season_id: "" },
  });

  const selectedLaunchId = form.watch("launch_id");
  const filteredSeasons = seasonItems.filter((s) => s.launch_id === selectedLaunchId);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createForm(values),
    onSuccess: () => {
      toast.success("Formulário criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao criar o formulário.");
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Novo Formulário</DialogTitle>
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
                    <Input placeholder="O Resgate dos Otimistas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
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
              name="launch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Launch</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("season_id", "");
                    }}
                    defaultValue={field.value}
                  >
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
              name="season_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedLaunchId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedLaunchId
                              ? "Selecione um launch primeiro"
                              : seasonsLoading
                                ? "Carregando..."
                                : "Selecione uma season"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSeasons.map((season) => (
                        <SelectItem key={season.id} value={season.id}>
                          {season.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Formulário
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
