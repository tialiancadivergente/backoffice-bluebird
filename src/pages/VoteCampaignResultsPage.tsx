import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchCampaignResults, fetchVoteCampaigns } from "@/api/vote-campaigns";

export default function VoteCampaignResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaigns } = useQuery({
    queryKey: ["vote-campaigns"],
    queryFn: fetchVoteCampaigns,
  });

  const campaign = (Array.isArray(campaigns) ? campaigns : []).find((c) => c.id === id);

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ["vote-campaign-results", id],
    queryFn: () => fetchCampaignResults(id!),
    enabled: !!id,
  });

  const sorted = useMemo(() => {
    return [...(results ?? [])].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vote-campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Resultados</h1>
          {campaign && (
            <p className="text-muted-foreground text-sm mt-0.5">{campaign.name}</p>
          )}
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
          Erro ao carregar os resultados. Tente novamente.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum resultado encontrado.</p>
          )}
          {sorted.map((candidate, index) => {
            const position = index + 1;
            const isTop3 = position <= 3;

            return (
              <div
                key={candidate.id}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                  isTop3 ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-lg text-muted-foreground shrink-0">
                  {position <= 3 ? (
                    position === 1 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : position === 2 ? (
                      <Medal className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Medal className="h-5 w-5 text-amber-700" />
                    )
                  ) : (
                    <span>{position}º</span>
                  )}
                </div>

                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={candidate.photo_url} alt={candidate.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {candidate.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{candidate.name}</p>
                  {candidate.story_text && (
                    <p className="text-sm text-muted-foreground truncate">{candidate.story_text}</p>
                  )}
                </div>

                <Badge variant="secondary" className="text-base font-bold px-3 py-1 shrink-0">
                  {candidate.vote_count ?? 0} votos
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
