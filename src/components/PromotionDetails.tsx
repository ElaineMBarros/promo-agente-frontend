import { useState, useEffect } from "react";
import styled from "styled-components";
import { PromotionRecord } from "../types";

interface PromotionDetailsProps {
  promotion: PromotionRecord;
  onClose: () => void;
  onSave?: (promotion: PromotionRecord) => Promise<void>;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.muted};
  padding: 4px 8px;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const Field = styled.div<{ $fullWidth?: boolean; $required?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${({ $fullWidth }) => $fullWidth ? '1 / -1' : 'auto'};
  position: relative;
`;

const Label = styled.label<{ $required?: boolean }>`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  
  ${({ $required }) => $required && `
    &::after {
      content: ' *';
      color: #e53e3e;
      font-weight: 700;
    }
  `}
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${({ $hasError, theme }) => $hasError ? '#e53e3e' : 'rgba(0, 0, 0, 0.12)'};
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError, theme }) => $hasError ? '#e53e3e' : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ $hasError }) => $hasError ? 'rgba(229, 62, 62, 0.1)' : 'rgba(31, 60, 136, 0.1)'};
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${({ $hasError, theme }) => $hasError ? '#e53e3e' : 'rgba(0, 0, 0, 0.12)'};
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError, theme }) => $hasError ? '#e53e3e' : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ $hasError }) => $hasError ? 'rgba(229, 62, 62, 0.1)' : 'rgba(31, 60, 136, 0.1)'};
  }
`;

const ErrorText = styled.span`
  color: #e53e3e;
  font-size: 0.85rem;
  font-weight: 500;
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${({ $variant = 'secondary', theme }) => $variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    
    &:hover {
      background: #1a3170;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(31, 60, 136, 0.3);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border: 1px solid rgba(0, 0, 0, 0.12);
    
    &:hover {
      background: #e8e8e8;
    }
  `}
`;

const Alert = styled.div<{ $type: 'error' | 'warning' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  ${({ $type }) => {
    if ($type === 'error') return `
      background: #fee;
      color: #c00;
      border: 1px solid #fcc;
    `;
    if ($type === 'warning') return `
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fde68a;
    `;
    return `
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    `;
  }}
`;

export function PromotionDetails({ promotion, onClose, onSave }: PromotionDetailsProps) {
  const [editedPromo, setEditedPromo] = useState<PromotionRecord>(promotion);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditedPromo(promotion);
  }, [promotion]);

  const validateRequired = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editedPromo.periodo_inicio?.trim()) {
      newErrors.periodo_inicio = 'Data de início é obrigatória';
    }
    
    if (!editedPromo.periodo_fim?.trim()) {
      newErrors.periodo_fim = 'Data de término é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateRequired()) {
      return;
    }
    
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(editedPromo);
        onClose();
      } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar promoção');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleChange = (field: keyof PromotionRecord, value: any) => {
    setEditedPromo(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo ao editar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const hasRequiredFields = editedPromo.periodo_inicio && editedPromo.periodo_fim;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>📋 Detalhes da Promoção</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        {!hasRequiredFields && (
          <Alert $type="error">
            ⚠️ <strong>Campos obrigatórios faltando:</strong> A vigência (data início e fim) é obrigatória para salvar a promoção.
          </Alert>
        )}

        {/* Informações Básicas */}
        <Section>
          <SectionTitle>📌 Informações Básicas</SectionTitle>
          <FieldGrid>
            <Field $fullWidth>
              <Label>Título</Label>
              <Input
                type="text"
                value={editedPromo.titulo || ''}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Digite o título da promoção"
              />
            </Field>
            
            <Field>
              <Label>Mecânica</Label>
              <Input
                type="text"
                value={editedPromo.mecanica || ''}
                onChange={(e) => handleChange('mecanica', e.target.value)}
                placeholder="Ex: desconto simples, progressiva"
              />
            </Field>
            
            <Field>
              <Label>Canal</Label>
              <Input
                type="text"
                value={editedPromo.canal || ''}
                onChange={(e) => handleChange('canal', e.target.value)}
                placeholder="Ex: Perfumaria G, Farma M"
              />
            </Field>
            
            <Field $fullWidth>
              <Label>Descrição</Label>
              <TextArea
                value={editedPromo.descricao || ''}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descrição completa da promoção"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Vigência - OBRIGATÓRIO */}
        <Section>
          <SectionTitle>📅 Vigência (OBRIGATÓRIO)</SectionTitle>
          <FieldGrid>
            <Field $required>
              <Label $required>Data de Início</Label>
              <Input
                type="text"
                value={editedPromo.periodo_inicio || ''}
                onChange={(e) => handleChange('periodo_inicio', e.target.value)}
                placeholder="DD/MM/AAAA"
                $hasError={!!errors.periodo_inicio}
              />
              {errors.periodo_inicio && <ErrorText>{errors.periodo_inicio}</ErrorText>}
            </Field>
            
            <Field $required>
              <Label $required>Data de Término</Label>
              <Input
                type="text"
                value={editedPromo.periodo_fim || ''}
                onChange={(e) => handleChange('periodo_fim', e.target.value)}
                placeholder="DD/MM/AAAA"
                $hasError={!!errors.periodo_fim}
              />
              {errors.periodo_fim && <ErrorText>{errors.periodo_fim}</ErrorText>}
            </Field>
          </FieldGrid>
        </Section>

        {/* Público-Alvo */}
        <Section>
          <SectionTitle>🎯 Público-Alvo</SectionTitle>
          <FieldGrid>
            <Field>
              <Label>Segmentação</Label>
              <Input
                type="text"
                value={editedPromo.segmentacao || ''}
                onChange={(e) => handleChange('segmentacao', e.target.value)}
                placeholder="Ex: Brasil, SP, Região Sul"
              />
            </Field>
            
            <Field>
              <Label>Público</Label>
              <Input
                type="text"
                value={editedPromo.publico_alvo || ''}
                onChange={(e) => handleChange('publico_alvo', e.target.value)}
                placeholder="Ex: Distribuidores, Atacadistas"
              />
            </Field>
            
            <Field>
              <Label>Cluster</Label>
              <Input
                type="text"
                value={editedPromo.cluster || ''}
                onChange={(e) => handleChange('cluster', e.target.value)}
                placeholder="Ex: 5-9 CKS, A1"
              />
            </Field>
            
            <Field $fullWidth>
              <Label>Detalhamento do Público</Label>
              <Input
                type="text"
                value={editedPromo.publico_detalhado || ''}
                onChange={(e) => handleChange('publico_detalhado', e.target.value)}
                placeholder="Informações adicionais sobre o público"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Campos Financeiros */}
        <Section>
          <SectionTitle>💰 Restrições Financeiras</SectionTitle>
          <FieldGrid>
            <Field>
              <Label>Ticket Mínimo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedPromo.ticket_minimo || ''}
                onChange={(e) => handleChange('ticket_minimo', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </Field>
            
            <Field>
              <Label>Ticket Máximo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedPromo.ticket_maximo || ''}
                onChange={(e) => handleChange('ticket_maximo', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </Field>
            
            <Field>
              <Label>Volume Mínimo</Label>
              <Input
                type="number"
                step="0.01"
                value={editedPromo.volume_minimo || ''}
                onChange={(e) => handleChange('volume_minimo', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </Field>
            
            <Field>
              <Label>Limite de Verba (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedPromo.limite_verba || ''}
                onChange={(e) => handleChange('limite_verba', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </Field>
            
            <Field>
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedPromo.desconto_percentual || ''}
                onChange={(e) => handleChange('desconto_percentual', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Produtos */}
        <Section>
          <SectionTitle>📦 Produtos</SectionTitle>
          <FieldGrid>
            <Field>
              <Label>Linha de Produto</Label>
              <Input
                type="text"
                value={editedPromo.linha_produto || ''}
                onChange={(e) => handleChange('linha_produto', e.target.value)}
                placeholder="Ex: Skincare, Oral Care"
              />
            </Field>
            
            <Field>
              <Label>Tipo de Mix</Label>
              <Input
                type="text"
                value={editedPromo.tipo_mix || ''}
                onChange={(e) => handleChange('tipo_mix', e.target.value)}
                placeholder="Ex: fechado, mixado, livre"
              />
            </Field>
            
            <Field>
              <Label>Quantidade Mínima</Label>
              <Input
                type="number"
                value={editedPromo.qt_minima || ''}
                onChange={(e) => handleChange('qt_minima', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
              />
            </Field>
            
            <Field>
              <Label>Categoria</Label>
              <Input
                type="text"
                value={editedPromo.categoria || ''}
                onChange={(e) => handleChange('categoria', e.target.value)}
                placeholder="Ex: Higiene, Beleza"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Condições e Recompensas */}
        <Section>
          <SectionTitle>✅ Regras</SectionTitle>
          <FieldGrid>
            <Field $fullWidth>
              <Label>Condições</Label>
              <TextArea
                value={editedPromo.condicoes || ''}
                onChange={(e) => handleChange('condicoes', e.target.value)}
                placeholder="Descrição das condições da promoção"
              />
            </Field>
            
            <Field $fullWidth>
              <Label>Recompensas</Label>
              <TextArea
                value={editedPromo.recompensas || ''}
                onChange={(e) => handleChange('recompensas', e.target.value)}
                placeholder="Descrição das recompensas/benefícios"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Gestão */}
        <Section>
          <SectionTitle>📊 Gestão e Controle</SectionTitle>
          <FieldGrid>
            <Field>
              <Label>Meta Mensal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedPromo.target_mensal || ''}
                onChange={(e) => handleChange('target_mensal', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </Field>
            
            <Field>
              <Label>Centro de Custo</Label>
              <Input
                type="text"
                value={editedPromo.centro_custo || ''}
                onChange={(e) => handleChange('centro_custo', e.target.value)}
                placeholder="Ex: CC-001"
              />
            </Field>
            
            <Field>
              <Label>Período de Apuração</Label>
              <Input
                type="text"
                value={editedPromo.periodo_apuracao || ''}
                onChange={(e) => handleChange('periodo_apuracao', e.target.value)}
                placeholder="Ex: mensal, quinzenal"
              />
            </Field>
            
            <Field>
              <Label>Prioridade</Label>
              <Input
                type="text"
                value={editedPromo.prioridade_promocao || ''}
                onChange={(e) => handleChange('prioridade_promocao', e.target.value)}
                placeholder="Ex: alta, média, baixa"
              />
            </Field>
            
            <Field $fullWidth>
              <Label>Observações</Label>
              <TextArea
                value={editedPromo.observacoes || ''}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações adicionais"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Informações do Sistema */}
        <Section>
          <SectionTitle>ℹ️ Informações do Sistema</SectionTitle>
          <FieldGrid>
            <Field>
              <Label>Status</Label>
              <Value>{editedPromo.status || 'N/A'}</Value>
            </Field>
            
            <Field>
              <Label>Criada em</Label>
              <Value>{new Date(editedPromo.created_at).toLocaleString('pt-BR')}</Value>
            </Field>
            
            {editedPromo.sent_at && (
              <Field>
                <Label>Enviada em</Label>
                <Value>{new Date(editedPromo.sent_at).toLocaleString('pt-BR')}</Value>
              </Field>
            )}
          </FieldGrid>
        </Section>

        <Actions>
          <Button $variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          {onSave && (
            <Button 
              $variant="primary" 
              onClick={handleSave}
              disabled={isSaving || !hasRequiredFields}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          )}
        </Actions>
      </Modal>
    </Overlay>
  );
}
