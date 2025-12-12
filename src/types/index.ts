export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  state?: any;
  status?: string;
}

export interface SystemStatus {
  system_ready: boolean;
  openai: boolean;
  openai_version: string | null;
  openai_model: string;
  agno_framework: boolean;
  agno_version: string | null;
  agno_status_error: string | null;
  orchestrator: boolean;
  extractor: boolean;
  validator: boolean;
  summarizer: boolean;
  memory_manager: boolean;
  sqlite_db: boolean;
  cosmos_db: boolean;
  blob_storage: boolean;
  messages_stored: number;
  promotions_count: number;
  python_version: string;
  environment: string;
}

export interface PromotionRecord {
  id: string;
  promo_id: string;
  session_id: string;
  titulo?: string;
  mecanica?: string;
  descricao?: string;
  segmentacao?: string;
  periodo_inicio?: string;  // OBRIGATÓRIO
  periodo_fim?: string;     // OBRIGATÓRIO
  condicoes?: string;
  recompensas?: string;
  status?: string;
  created_at: string;
  sent_at?: string;
  
  // Campos de canal e público
  canal?: string;
  publico_alvo?: string;
  cluster?: string;
  publico_detalhado?: string;
  
  // Campos financeiros
  ticket_minimo?: number;
  ticket_maximo?: number;
  volume_minimo?: number;
  limite_verba?: number;
  desconto_percentual?: number;
  
  // Campos de produto
  produtos?: string[];
  linha_produto?: string;
  tipo_mix?: string;
  categoria?: string;
  fabricante?: string;
  codigo_interno?: string;
  grupo?: string;
  combo?: string;
  sku_ean?: string;
  descricao_sku?: string;
  brinde_sku?: string;
  qt_minima?: number;
  
  // Campos de gestão
  target_mensal?: number;
  centro_custo?: string;
  periodo_apuracao?: string;
  promocao_exclusiva?: string;
  prioridade_promocao?: string;
  gatilhos_ean_ou_familias?: string;
  regra_composicao_familia?: string;
  observacoes?: string;
}
