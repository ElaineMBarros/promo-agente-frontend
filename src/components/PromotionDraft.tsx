import styled from "styled-components";

interface PromotionDraftProps {
  data?: any | any[];
  isMultiple?: boolean;
}

const DraftContainer = styled.div`
  background: #f8f9fa;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

const DraftHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #6c757d;
  font-weight: 600;
  font-size: 1.1rem;
`;

const FieldList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FieldItem = styled.li`
  padding: 6px 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  &::before {
    content: "•";
    color: #6c757d;
    font-weight: bold;
    margin-right: 4px;
  }
`;

const FieldLabel = styled.span`
  font-weight: 600;
  color: #495057;
  min-width: 140px;
`;

const FieldValue = styled.span`
  color: #212529;
  flex: 1;
  
  &.missing {
    color: #dc3545;
    font-style: italic;
  }
`;

const ProgressBar = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #dee2e6;
  font-size: 0.9rem;
  color: #6c757d;
`;

const PromotionSeparator = styled.hr`
  margin: 16px 0;
  border: none;
  border-top: 2px solid #dee2e6;
`;

const PromotionSubheader = styled.h4`
  color: #495057;
  font-size: 1rem;
  margin-bottom: 12px;
  font-weight: 600;
`;

const AdditionalSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #dee2e6;
`;

const SectionTitle = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
`;

// Conta quantos campos obrigatórios estão preenchidos
function getFilledCount(promo: any): number {
  const requiredFields = [
    'titulo',
    'mecanica',
    'descricao',
    'segmentacao',
    'periodo_inicio',
    'periodo_fim',
    'condicoes',
    'recompensas'
  ];
  
  let count = 0;
  for (const field of requiredFields) {
    if (field === 'segmentacao') {
      // Aceita segmentacao OU publico_alvo
      if ((promo.segmentacao && promo.segmentacao.toString().trim()) ||
          (promo.publico_alvo && promo.publico_alvo.toString().trim())) {
        count++;
      }
    } else {
      if (promo[field] && promo[field].toString().trim()) {
        count++;
      }
    }
  }
  
  return count;
}

// Renderiza um campo com label e valor
function renderField(label: string, value: any): JSX.Element {
  const hasValue = value && value.toString().trim() !== '';
  
  return (
    <FieldItem>
      <FieldLabel>{label}:</FieldLabel>
      <FieldValue className={!hasValue ? 'missing' : ''}>
        {hasValue ? value : '[FALTANDO] ⚠️'}
      </FieldValue>
    </FieldItem>
  );
}

export function PromotionDraft({ data, isMultiple }: PromotionDraftProps) {
  if (!data) return null;
  
  const promotions = isMultiple ? data : [data];
  
  return (
    <DraftContainer>
      <DraftHeader>
        📝 {isMultiple ? 'Promoções em progresso...' : 'Promoção em progresso...'}
      </DraftHeader>
      
      {promotions.map((promo: any, index: number) => (
        <div key={index}>
          {isMultiple && (
            <PromotionSubheader>Promoção #{index + 1}</PromotionSubheader>
          )}
          
          <SectionTitle>Campos Obrigatórios</SectionTitle>
          <FieldList>
            {renderField('Título', promo.titulo)}
            {renderField('Mecânica', promo.mecanica)}
            {renderField('Descrição', promo.descricao)}
            {renderField('Segmentação', promo.segmentacao || promo.publico_alvo)}
            {renderField('Data Início', promo.periodo_inicio)}
            {renderField('Data Fim', promo.periodo_fim)}
            {renderField('Condições', promo.condicoes)}
            {renderField('Recompensas', promo.recompensas)}
          </FieldList>
          
          {/* Seção de informações adicionais (se houver) */}
          {(promo.canal || promo.produtos?.length > 0 || promo.desconto_percentual || 
            promo.ticket_minimo || promo.ticket_maximo || promo.limite_verba) && (
            <AdditionalSection>
              <SectionTitle>Informações Adicionais</SectionTitle>
              <FieldList>
                {promo.canal && renderField('Canal', promo.canal)}
                {promo.produtos?.length > 0 && renderField('Produtos', promo.produtos.join(', '))}
                {promo.desconto_percentual && renderField('Desconto', `${promo.desconto_percentual}%`)}
                {promo.ticket_minimo && renderField('Ticket Mínimo', `R$ ${promo.ticket_minimo.toLocaleString('pt-BR')}`)}
                {promo.ticket_maximo && renderField('Ticket Máximo', `R$ ${promo.ticket_maximo.toLocaleString('pt-BR')}`)}
                {promo.limite_verba && renderField('Limite de Verba', `R$ ${promo.limite_verba.toLocaleString('pt-BR')}`)}
              </FieldList>
            </AdditionalSection>
          )}
          
          <ProgressBar>
            📊 Progresso: {getFilledCount(promo)} de 8 campos obrigatórios preenchidos
          </ProgressBar>
          
          {isMultiple && index < promotions.length - 1 && <PromotionSeparator />}
        </div>
      ))}
    </DraftContainer>
  );
}
