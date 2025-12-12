import styled from "styled-components";

interface PromotionData {
  titulo?: string;
  mecanica?: string;
  descricao?: string;
  segmentacao?: string;
  canal?: string;
  periodo_inicio?: string;
  periodo_fim?: string;
  condicoes?: string;
  recompensas?: string;
  produtos?: string[];
  desconto_percentual?: number;
  ticket_minimo?: number;
  ticket_maximo?: number;
  volume_minimo?: number;
  limite_verba?: number;
  qt_minima?: number;
  cluster?: string;
  linha_produto?: string;
  tipo_mix?: string;
}

interface PromotionPreviewProps {
  data?: PromotionData | PromotionData[];
  isMultiple?: boolean;
  onExportExcel?: () => void;
  onConfirm?: () => void;
}

const Container = styled.div`
  background: #f8f9fa;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
`;

const Badge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const ActionsFooter = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'success' }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  background: ${({ $variant }) => 
    $variant === 'success' ? '#10b981' : '#1f3c88'};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${({ $variant }) => 
      $variant === 'success' ? '#059669' : '#1a3470'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const PromoSection = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const PromoTitle = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.05rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const Field = styled.div<{ $status?: 'ok' | 'warning' | 'missing' }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 6px;
  background: white;
  border-left: 3px solid ${({ $status }) => {
    if ($status === 'ok') return '#10b981';
    if ($status === 'warning') return '#f59e0b';
    return '#ef4444';
  }};
`;

const FieldLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldValue = styled.span<{ $status?: 'ok' | 'warning' | 'missing' }>`
  font-size: 0.95rem;
  color: ${({ $status }) => {
    if ($status === 'ok') return '#1f2937';
    if ($status === 'warning') return '#92400e';
    return '#991b1b';
  }};
  font-weight: ${({ $status }) => $status === 'missing' ? '600' : '400'};
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
  display: flex;
  align-items: start;
  gap: 8px;
`;

const WarningText = styled.div`
  color: #92400e;
  font-size: 0.9rem;
  
  strong {
    font-weight: 700;
  }
`;

const SuccessBox = styled.div`
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #065f46;
  font-weight: 600;
`;

function PromotionItem({ data, index }: { data: PromotionData; index?: number }) {
  // Campos obrigatórios
  const hasTitle = !!data.titulo?.trim();
  const hasMecanica = !!data.mecanica?.trim();
  const hasDescription = !!data.descricao?.trim();
  const hasSegmentacao = !!data.segmentacao?.trim();
  const hasPeriodoInicio = !!data.periodo_inicio?.trim();
  const hasPeriodoFim = !!data.periodo_fim?.trim();
  const hasCondicoes = !!data.condicoes?.trim();
  const hasRecompensas = !!data.recompensas?.trim();
  
  // Campos opcionais mas importantes
  const hasCanal = !!data.canal?.trim();
  const hasDesconto = data.desconto_percentual !== undefined && data.desconto_percentual > 0;
  const hasProdutos = data.produtos && data.produtos.length > 0;
  
  // Conta campos faltantes OBRIGATÓRIOS
  const missingFields: string[] = [];
  if (!hasTitle && !hasDescription) missingFields.push('titulo ou descrição');
  if (!hasPeriodoInicio) missingFields.push('período início');
  if (!hasPeriodoFim) missingFields.push('período fim');
  if (!hasCondicoes) missingFields.push('condições');
  if (!hasRecompensas) missingFields.push('recompensas');
  if (!hasSegmentacao) missingFields.push('segmentação');
  
  const isComplete = missingFields.length === 0;
  
  return (
    <PromoSection>
      {index !== undefined && (
        <PromoTitle>
          <span>PROMOÇÃO {index}</span>
          {isComplete ? <span>✅</span> : <span>⚠️</span>}
        </PromoTitle>
      )}
      
      <FieldGrid>
        {/* Título */}
        <Field $status={hasTitle ? 'ok' : 'warning'}>
          <FieldLabel>Título</FieldLabel>
          <FieldValue $status={hasTitle ? 'ok' : 'warning'}>
            {hasTitle ? data.titulo : '(vazio)'}
          </FieldValue>
        </Field>
        
        {/* Mecânica */}
        <Field $status={hasMecanica ? 'ok' : 'warning'}>
          <FieldLabel>Mecânica</FieldLabel>
          <FieldValue $status={hasMecanica ? 'ok' : 'warning'}>
            {hasMecanica ? data.mecanica : '(vazio)'}
          </FieldValue>
        </Field>
        
        {/* Canal */}
        {hasCanal && (
          <Field $status="ok">
            <FieldLabel>Canal</FieldLabel>
            <FieldValue $status="ok">{data.canal}</FieldValue>
          </Field>
        )}
        
        {/* Segmentação - OBRIGATÓRIO */}
        <Field $status={hasSegmentacao ? 'ok' : 'missing'}>
          <FieldLabel>Segmentação *</FieldLabel>
          <FieldValue $status={hasSegmentacao ? 'ok' : 'missing'}>
            {hasSegmentacao ? data.segmentacao : '⚠️ FALTANDO'}
          </FieldValue>
        </Field>
        
        {/* Período Início - OBRIGATÓRIO */}
        <Field $status={hasPeriodoInicio ? 'ok' : 'missing'}>
          <FieldLabel>📅 Início *</FieldLabel>
          <FieldValue $status={hasPeriodoInicio ? 'ok' : 'missing'}>
            {hasPeriodoInicio ? data.periodo_inicio : '⚠️ FALTANDO'}
          </FieldValue>
        </Field>
        
        {/* Período Fim - OBRIGATÓRIO */}
        <Field $status={hasPeriodoFim ? 'ok' : 'missing'}>
          <FieldLabel>📅 Fim *</FieldLabel>
          <FieldValue $status={hasPeriodoFim ? 'ok' : 'missing'}>
            {hasPeriodoFim ? data.periodo_fim : '⚠️ FALTANDO'}
          </FieldValue>
        </Field>
        
        {/* Desconto */}
        {hasDesconto && (
          <Field $status="ok">
            <FieldLabel>💰 Desconto</FieldLabel>
            <FieldValue $status="ok">{data.desconto_percentual}%</FieldValue>
          </Field>
        )}
        
        {/* Cluster */}
        {data.cluster && (
          <Field $status="ok">
            <FieldLabel>Cluster</FieldLabel>
            <FieldValue $status="ok">{data.cluster}</FieldValue>
          </Field>
        )}
        
        {/* Quantidade Mínima */}
        {data.qt_minima && (
          <Field $status="ok">
            <FieldLabel>Qt. Mínima</FieldLabel>
            <FieldValue $status="ok">{data.qt_minima} cxs</FieldValue>
          </Field>
        )}
        
        {/* Campos Financeiros */}
        {data.ticket_minimo && (
          <Field $status="ok">
            <FieldLabel>💵 Ticket Mínimo</FieldLabel>
            <FieldValue $status="ok">R$ {data.ticket_minimo.toLocaleString('pt-BR')}</FieldValue>
          </Field>
        )}
        
        {data.ticket_maximo && (
          <Field $status="ok">
            <FieldLabel>💵 Ticket Máximo</FieldLabel>
            <FieldValue $status="ok">R$ {data.ticket_maximo.toLocaleString('pt-BR')}</FieldValue>
          </Field>
        )}
        
        {data.volume_minimo && (
          <Field $status="ok">
            <FieldLabel>📊 Volume Mínimo</FieldLabel>
            <FieldValue $status="ok">{data.volume_minimo.toLocaleString('pt-BR')}</FieldValue>
          </Field>
        )}
        
        {data.limite_verba && (
          <Field $status="ok">
            <FieldLabel>💰 Limite Verba</FieldLabel>
            <FieldValue $status="ok">R$ {data.limite_verba.toLocaleString('pt-BR')}</FieldValue>
          </Field>
        )}
      </FieldGrid>
      
      {/* Descrição */}
      {hasDescription && (
        <Field $status="ok" style={{ marginTop: '12px' }}>
          <FieldLabel>Descrição</FieldLabel>
          <FieldValue $status="ok">{data.descricao}</FieldValue>
        </Field>
      )}
      
      {/* Produtos */}
      {hasProdutos && (
        <Field $status="ok" style={{ marginTop: '12px' }}>
          <FieldLabel>📦 Produtos</FieldLabel>
          <FieldValue $status="ok">{data.produtos!.join(', ')}</FieldValue>
        </Field>
      )}
      
      {/* Condições */}
      {hasCondicoes && (
        <Field $status="ok" style={{ marginTop: '12px' }}>
          <FieldLabel>✅ Condições</FieldLabel>
          <FieldValue $status="ok">{data.condicoes}</FieldValue>
        </Field>
      )}
      
      {/* Recompensas */}
      {hasRecompensas && (
        <Field $status="ok" style={{ marginTop: '12px' }}>
          <FieldLabel>🎁 Recompensas</FieldLabel>
          <FieldValue $status="ok">{data.recompensas}</FieldValue>
        </Field>
      )}
      
      {/* Alertas */}
      {isComplete ? (
        <SuccessBox>
          ✅ <strong>Promoção completa!</strong> Todos os campos obrigatórios preenchidos.
        </SuccessBox>
      ) : (
        <WarningBox>
          <span>⚠️</span>
          <WarningText>
            <strong>Faltam {missingFields.length} campo(s) obrigatório(s):</strong><br />
            {missingFields.join(', ')}
          </WarningText>
        </WarningBox>
      )}
    </PromoSection>
  );
}

export function PromotionPreview({ data, isMultiple, onExportExcel, onConfirm }: PromotionPreviewProps) {
  if (!data) return null;
  
  console.log('🔍 PromotionPreview RENDER - data:', data);
  console.log('🔍 PromotionPreview RENDER - isMultiple:', isMultiple);
  console.log('🔍 PromotionPreview RENDER - Array.isArray(data):', Array.isArray(data));
  
  const promos = Array.isArray(data) ? data : [data];
  const count = promos.length;
  
  console.log('🔍 PromotionPreview RENDER - promos array:', promos);
  console.log('🔍 PromotionPreview RENDER - count:', count);
  
  return (
    <Container>
      <Header>
        <Title>📝 Dados Coletados</Title>
        <Badge>{count} {count > 1 ? 'promoções' : 'promoção'}</Badge>
      </Header>
      
      {promos.map((promo, index) => (
        <PromotionItem 
          key={index} 
          data={promo} 
          index={isMultiple || count > 1 ? index + 1 : undefined}
        />
      ))}

      <ActionsFooter>
        {onExportExcel && (
          <ActionButton $variant="primary" onClick={onExportExcel}>
            📊 Exportar Excel
          </ActionButton>
        )}
        {onConfirm && (
          <ActionButton $variant="success" onClick={onConfirm}>
            ✅ Confirmar
          </ActionButton>
        )}
      </ActionsFooter>
    </Container>
  );
}
