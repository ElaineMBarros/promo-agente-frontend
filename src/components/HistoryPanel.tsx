import { useState } from "react";
import styled from "styled-components";
import { PromotionRecord } from "../types";
import { PromotionDetails } from "./PromotionDetails";

interface HistoryPanelProps {
  records: PromotionRecord[];
  sessionId?: string;
  onPromotionUpdated?: (promotion: PromotionRecord) => void;  // ✅ MUDADO: Recebe a promoção atualizada
}

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin: 0;
`;

const ExportAllButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || '#1a3170'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(31, 60, 136, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const PromoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;  /* Ocupa todo espaço disponível */
  overflow-y: auto;  /* Scroll vertical independente */
  overflow-x: hidden;
  padding-right: 8px;  /* Espaço para scrollbar */
  margin-right: -8px;  /* Compensa padding para alinhar */
  
  /* Scrollbar customizada - bem visível */
  &::-webkit-scrollbar {
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(31, 60, 136, 0.08);
    border-radius: 6px;
    margin: 4px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 6px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primaryDark || '#1a3170'};
    background-clip: padding-box;
  }
`;

const PromoCard = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(31, 60, 136, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PromoTitle = styled.h3`
  font-size: 1.05rem;
  margin-bottom: 8px;
`;

const PromoMeta = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  border: 1px dashed rgba(31, 60, 136, 0.2);
  border-radius: 12px;
  background: #ffffff;
  color: ${({ theme }) => theme.colors.muted};
`;

export function HistoryPanel({ records, sessionId, onPromotionUpdated }: HistoryPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionRecord | null>(null);

  const handleExportSession = async () => {
    if (records.length === 0) {
      alert('⚠️ Nenhuma promoção confirmada nesta sessão para exportar.');
      return;
    }

    setIsExporting(true);
    
    try {
      console.log('📊 Exportando sessão com', records.length, 'promoção(ões)...');
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://promo-functions-cpa5ajcfftdgawc2.canadacentral-01.azurewebsites.net";
      const response = await fetch(`${baseUrl}/api/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          promotions: records
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.excel_base64) {
        console.log(`✅ Excel da sessão recebido`);
        
        // Converte base64 para blob
        const byteCharacters = atob(data.excel_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        // Cria link de download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || `promocoes_sessao_${sessionId?.slice(0, 8)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ Download da sessão iniciado!');
        alert(`✅ Excel da sessão gerado com ${records.length} promoção(ões)!`);
      } else {
        throw new Error(data.error || 'Erro desconhecido ao gerar Excel');
      }
    } catch (error) {
      console.error('❌ Erro ao exportar sessão:', error);
      alert(`❌ Erro ao exportar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    
    try {
      console.log('📊 Iniciando exportação de todas as promoções...');
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://promo-functions-cpa5ajcfftdgawc2.canadacentral-01.azurewebsites.net";
      const response = await fetch(`${baseUrl}/api/export-all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.excel_base64) {
        console.log(`✅ Excel recebido: ${data.total_promocoes} promoção(ões)`);
        
        // Converte base64 para blob
        const byteCharacters = atob(data.excel_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        // Cria link de download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || 'promocoes_completo.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ Download iniciado!');
        alert(`✅ Excel gerado com ${data.total_promocoes} promoção(ões)!`);
      } else {
        throw new Error(data.error || 'Erro desconhecido ao gerar Excel');
      }
    } catch (error) {
      console.error('❌ Erro ao exportar:', error);
      alert(`❌ Erro ao exportar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (records.length === 0) {
    return (
      <PanelWrapper>
        <Header>
          <Title>📋 Promoções desta sessão</Title>
        </Header>
        <EmptyState>
          Nenhuma promoção confirmada nesta sessão ainda.<br />
          Confirme uma promoção no chat para vê-la aqui.
        </EmptyState>
      </PanelWrapper>
    );
  }

  // ✅ Mostra todas as promoções da sessão (em ordem reversa - mais recentes primeiro)
  const sessionRecords = [...records].reverse();

  return (
    <PanelWrapper>
      <Header>
        <Title>📋 Promoções desta sessão</Title>
        <ExportAllButton 
          onClick={handleExportSession}
          disabled={isExporting || records.length === 0}
        >
          📊 {isExporting ? 'Exportando...' : 'Exportar Sessão'}
        </ExportAllButton>
      </Header>
      <PromoList>
        {sessionRecords.map(record => (
          <PromoCard 
            key={record.id}
            onClick={() => setSelectedPromotion(record)}
          >
            <PromoTitle>{record.titulo || "Promoção sem título"}</PromoTitle>
            <PromoMeta>
              {record.mecanica && `📊 ${record.mecanica} • `}
              {record.segmentacao || "Público geral"}
            </PromoMeta>
            <PromoMeta>
              📅 {record.periodo_inicio && record.periodo_fim 
                ? `${record.periodo_inicio} até ${record.periodo_fim}` 
                : "⚠️ Período não especificado (OBRIGATÓRIO)"}
            </PromoMeta>
            {(record.ticket_minimo || record.ticket_maximo || record.limite_verba) && (
              <PromoMeta>
                💰 {record.ticket_minimo && `Min: R$ ${record.ticket_minimo.toLocaleString('pt-BR')}`}
                {record.ticket_maximo && ` • Max: R$ ${record.ticket_maximo.toLocaleString('pt-BR')}`}
                {record.limite_verba && ` • Verba: R$ ${record.limite_verba.toLocaleString('pt-BR')}`}
              </PromoMeta>
            )}
            <PromoMeta>
              {record.sent_at 
                ? `✅ Enviada: ${new Date(record.sent_at).toLocaleString("pt-BR")}`
                : `💾 Criada: ${new Date(record.created_at).toLocaleString("pt-BR")}`}
            </PromoMeta>
          </PromoCard>
        ))}
      </PromoList>
      
      {selectedPromotion && (
        <PromotionDetails
          promotion={selectedPromotion}
          onClose={() => setSelectedPromotion(null)}
          onSave={async (updated) => {
            try {
              console.log('💾 Salvando promoção atualizada:', updated);
              
              // Chama API para atualizar no Cosmos DB
              const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'https://promo-functions-cpa5ajcfftdgawc2.canadacentral-01.azurewebsites.net'}/api/update-promotion`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    promotion_id: updated.id,
                    updates: updated
                  })
                }
              );
              
              if (!response.ok) {
                throw new Error(`Erro ao atualizar: ${response.status}`);
              }
              
              const result = await response.json();
              console.log('✅ Promoção atualizada com sucesso:', result);
              
              // Fecha o modal
              setSelectedPromotion(null);
              
              // Atualiza no sessionHistory através do callback
              if (onPromotionUpdated) {
                onPromotionUpdated(result.promotion || updated);
              }
            } catch (error) {
              console.error('❌ Erro ao salvar promoção:', error);
              alert(`Erro ao salvar promoção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            }
          }}
        />
      )}
    </PanelWrapper>
  );
}
