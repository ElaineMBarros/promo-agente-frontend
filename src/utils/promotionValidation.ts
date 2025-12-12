/**
 * Utilitários para validação de promoções
 * Verifica se todos os campos obrigatórios estão preenchidos
 */

/**
 * Verifica se uma promoção individual está completa
 * @param promotion - Objeto da promoção
 * @returns true se todos os campos obrigatórios estão preenchidos
 */
export function isPromotionComplete(promotion: any): boolean {
  if (!promotion || typeof promotion !== 'object') {
    return false;
  }

  const requiredFields = [
    'titulo',
    'mecanica',
    'descricao',
    'segmentacao',  // aceita também 'publico_alvo'
    'periodo_inicio',
    'periodo_fim',
    'condicoes',
    'recompensas'
  ];
  
  return requiredFields.every(field => {
    if (field === 'segmentacao') {
      // Aceita 'segmentacao' OU 'publico_alvo' como válido
      const segmentacao = promotion.segmentacao;
      const publicoAlvo = promotion.publico_alvo;
      
      return (segmentacao && segmentacao.toString().trim() !== '') ||
             (publicoAlvo && publicoAlvo.toString().trim() !== '');
    }
    
    // Para outros campos, valida normalmente
    const value = promotion[field];
    return value && value.toString().trim() !== '';
  });
}

/**
 * Retorna o progresso de preenchimento de uma promoção
 * @param promotion - Objeto da promoção
 * @returns Objeto com contagem de campos preenchidos, total e percentual
 */
export function getPromotionProgress(promotion: any): {
  filled: number;
  total: number;
  percentage: number;
} {
  if (!promotion || typeof promotion !== 'object') {
    return { filled: 0, total: 8, percentage: 0 };
  }

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
  
  let filled = 0;
  
  for (const field of requiredFields) {
    if (field === 'segmentacao') {
      // Aceita segmentacao OU publico_alvo
      if ((promotion.segmentacao && promotion.segmentacao.toString().trim()) ||
          (promotion.publico_alvo && promotion.publico_alvo.toString().trim())) {
        filled++;
      }
    } else {
      if (promotion[field] && promotion[field].toString().trim()) {
        filled++;
      }
    }
  }
  
  const total = requiredFields.length;
  const percentage = Math.round((filled / total) * 100);
  
  return { filled, total, percentage };
}

/**
 * Verifica se todas as promoções em um array estão completas
 * @param promotions - Array de promoções
 * @returns true se TODAS as promoções estão completas
 */
export function areAllPromotionsComplete(promotions: any[]): boolean {
  if (!Array.isArray(promotions) || promotions.length === 0) {
    return false;
  }
  
  return promotions.every(promo => isPromotionComplete(promo));
}

/**
 * Retorna lista de campos faltantes em uma promoção
 * @param promotion - Objeto da promoção
 * @returns Array com nomes dos campos faltantes
 */
export function getMissingFields(promotion: any): string[] {
  if (!promotion || typeof promotion !== 'object') {
    return ['titulo', 'mecanica', 'descricao', 'segmentacao', 'periodo_inicio', 'periodo_fim', 'condicoes', 'recompensas'];
  }

  const requiredFieldsMap: { [key: string]: string } = {
    'titulo': 'Título',
    'mecanica': 'Mecânica',
    'descricao': 'Descrição',
    'segmentacao': 'Segmentação',
    'periodo_inicio': 'Data Início',
    'periodo_fim': 'Data Fim',
    'condicoes': 'Condições',
    'recompensas': 'Recompensas'
  };
  
  const missing: string[] = [];
  
  for (const [field, label] of Object.entries(requiredFieldsMap)) {
    if (field === 'segmentacao') {
      // Verifica segmentacao OU publico_alvo
      if (!((promotion.segmentacao && promotion.segmentacao.toString().trim()) ||
            (promotion.publico_alvo && promotion.publico_alvo.toString().trim()))) {
        missing.push(label);
      }
    } else {
      if (!promotion[field] || promotion[field].toString().trim() === '') {
        missing.push(label);
      }
    }
  }
  
  return missing;
}

/**
 * Retorna progresso total de múltiplas promoções
 * @param promotions - Array de promoções
 * @returns Objeto com total de campos preenchidos e progresso percentual geral
 */
export function getMultiplePromotionsProgress(promotions: any[]): {
  totalFilled: number;
  totalFields: number;
  percentage: number;
  completedPromotions: number;
  totalPromotions: number;
} {
  if (!Array.isArray(promotions) || promotions.length === 0) {
    return {
      totalFilled: 0,
      totalFields: 0,
      percentage: 0,
      completedPromotions: 0,
      totalPromotions: 0
    };
  }
  
  let totalFilled = 0;
  let completedPromotions = 0;
  
  for (const promo of promotions) {
    const progress = getPromotionProgress(promo);
    totalFilled += progress.filled;
    
    if (isPromotionComplete(promo)) {
      completedPromotions++;
    }
  }
  
  const totalFields = promotions.length * 8;
  const percentage = Math.round((totalFilled / totalFields) * 100);
  
  return {
    totalFilled,
    totalFields,
    percentage,
    completedPromotions,
    totalPromotions: promotions.length
  };
}
