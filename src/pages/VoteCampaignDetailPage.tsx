import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchVoteCampaigns, fetchCategories, fetchCandidates,
  deleteCategory, deleteCandidate,
  type VoteCategory, type VoteCandidate,
} from "@/api/vote-campaigns";
import { CreateCategoryDialog } from "@/components/vote-campaigns/CreateCategoryDialog";
import { CreateCandidateDialog } from "@/components/vote-campaigns/CreateCandidateDialog";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function VoteCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "candidate"; id: string; name: string } | null>(null);

  const campaignQuery = useQuery({
    queryKey: ["vote-campaigns"],
    queryFn: fetchVoteCampaigns,
    select: (campaigns) => campaigns.find((c) => c.id === id),
  });

  const categoriesQuery = useQuery({
    queryKey: ["vote-campaign-categories", id],
    queryFn: () => fetchCategories(id!),
    enabled: !!id,
  });

  const candidatesQuery = useQuery({
    queryKey: ["vote-campaign-candidates", id],
    queryFn: () => fetchCandidates(id!),
    enabled: !!id,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(id!, categoryId),
    onSuccess: () => {
      toast.success("Categoria excluída!");
      queryClient.invalidateQueries({ queryKey: ["vote-campaign-categories", id] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir categoria."),
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (candidateId: string) => deleteCandidate(id!, candidateId),
    onSuccess: () => {
      toast.success("Candidato excluído!");
      queryClient.invalidateQueries({ queryKey: ["vote-campaign-candidates", id] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir candidato."),
  });

  const campaign = campaignQuery.data;
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const candidates = Array.isArray(candidatesQuery.data) ? candidatesQuery.data : [];
  const isDeleting = deleteCategoryMutation.isPending || deleteCandidateMutation.isPending;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") {
      deleteCategoryMutation.mutate(deleteTarget.id);
    } else {
      deleteCandidateMutation.mutate(deleteTarget.id);
    }
  };

  if (campaignQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (campaignQuery.isError || !campaign) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/vote-campaigns")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
          Erro ao carregar a campanha.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vote-campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{campaign.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{campaign.description}</p>
        </div>
        <Badge variant={campaign.active ? "default" : "outline"} className={campaign.active ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
          {campaign.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Início</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{formatDate(campaign.starts_at)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fim</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{formatDate(campaign.ends_at)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Categorias</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{campaign.category_count}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Votos</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{campaign.vote_count}</p></CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorias</CardTitle>
          <Button size="sm" onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          {categoriesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((cat) => {
                const catCandidates = candidates.filter((c) => c.category_id === cat.id);
                const totalVotes = catCandidates.reduce((sum, c) => sum + c.vote_count, 0);
                return (
                  <Card key={cat.id} className="border bg-muted/30">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{cat.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => setDeleteTarget({ type: "category", id: cat.id, name: cat.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cat.description && (
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span><strong className="text-foreground">{catCandidates.length}</strong> candidato(s)</span>
                        <span><strong className="text-foreground">{totalVotes}</strong> voto(s)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Criada em {formatDate(cat.created_at)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Candidatos</CardTitle>
          <Button size="sm" onClick={() => setCandidateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Candidato
          </Button>
        </CardHeader>
        <CardContent>
          {candidatesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Nenhum candidato cadastrado.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {candidates.map((cand) => {
                const catName = categories.find((c) => c.id === cand.category_id)?.name ?? "—";
                return (
                  <Card key={cand.id} className="border bg-muted/30">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="flex items-center gap-3">
                        {cand.image_url ? (
                          <img
                            src={cand.image_url}
                            alt={cand.name}
                            className="h-10 w-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground border">
                            {cand.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base">{cand.name}</CardTitle>
                          <p className="text-xs text-muted-foreground font-mono">{cand.slug}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => setDeleteTarget({ type: "candidate", id: cand.id, name: cand.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {cand.description && (
                        <p className="text-sm text-muted-foreground">{cand.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{catName}</Badge>
                        <span className="font-semibold text-foreground text-sm">{cand.vote_count} voto(s)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Criado em {formatDate(cand.created_at)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateCategoryDialog campaignId={id!} open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
      <CreateCandidateDialog campaignId={id!} categories={categories} open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {deleteTarget?.type === "category" ? "categoria" : "candidato"}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
