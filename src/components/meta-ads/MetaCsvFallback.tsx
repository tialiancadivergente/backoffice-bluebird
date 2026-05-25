import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMetaCsvExportUrl, importMetaCsv } from "@/api/meta-ads";
import type { MetaPerformanceFilters } from "@/types/meta-ads";

type Props = {
  filters?: MetaPerformanceFilters;
};

const CSV_TEMPLATE_HEADER =
  "data,conta_id,campanha_id,campanha_nome,conjunto_id,conjunto_nome,anuncio_id,anuncio_nome,plataforma,impressoes,cliques,cliques_link,alcance,gasto,ctr,cpc,cpm,leads,visualizacoes_pagina,inicios_checkout,compras,connect_rate,video_thruplay";

const CSV_TEMPLATE_EXAMPLE =
  "2025-05-01,123456789,987654321,Campanha Captação Maio,111222333,Conjunto Remarketing,444555666,Anúncio Video 01,facebook,10000,250,180,8500,350.00,2.50,1.40,35.00,12,95,8,2,0.5278,45";

function downloadTemplate() {
  const content = [CSV_TEMPLATE_HEADER, CSV_TEMPLATE_EXAMPLE].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meta-ads-modelo.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function MetaCsvFallback({ filters }: Props) {
  const exportUrl = getMetaCsvExportUrl(filters);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setImporting(true);
    try {
      const result = await importMetaCsv(file);
      toast.success(`Importação concluída: ${result.imported} linhas importadas${result.skipped > 0 ? `, ${result.skipped} ignoradas` : ""}.`);
    } catch {
      toast.error("Erro ao importar CSV. Verifique o formato do arquivo.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
      <div>
        <p className="text-sm font-medium">Fallback CSV</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Importe dados manualmente, exporte os dados processados ou baixe o modelo.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          <Upload className="mr-2 h-4 w-4" />
          {importing ? "Importando..." : "Importar CSV"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Modelo
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={exportUrl} download="meta-ads-performance.csv">
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </a>
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Colunas do modelo:</p>
        <p className="font-mono text-[10px] break-all leading-relaxed text-muted-foreground/70">
          {CSV_TEMPLATE_HEADER}
        </p>
      </div>
    </div>
  );
}
