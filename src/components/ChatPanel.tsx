import { FormEvent, useState, useEffect } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "../services/api";
import { ChatMessage } from "../types";
import { PromotionPreview } from "./PromotionPreview";
import { isPromotionComplete, areAllPromotionsComplete } from "../utils/promotionValidation";

interface ChatPanelProps {
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  sessionId?: string;
  onSessionChange: (sessionId: string) => void;
  currentState?: any;
  onStateChange?: (state: any) => void;
  onPromotionCompleted?: () => void;
  onPromotionConfirmed?: (promotion: any) => void; // ✅ NOVO: Callback ao confirmar promoção
}

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
`;

const NewPromotionButton = styled.button`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 8px 16px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(31, 60, 136, 0.2);
  }
`;

const ExportButton = styled.button`
  border-radius: 8px;
  border: none;
  padding: 12px 20px;
  background: #ff0000;  /* VERMELHO CHAMATIVO PARA DEBUG */
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);

  &:hover {
    background: #cc0000;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 0, 0, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;  /* Scroll vertical independente */
  overflow-x: hidden;
  padding-right: 8px;
  margin-right: -8px;  /* Compensa padding */
  display: flex;
  flex-direction: column;
  gap: 16px;
  
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
    background: ${({ theme }) => theme.colors.secondary};
    background-clip: padding-box;
  }
`;

const MessageBubble = styled.div<{ $origin: "user" | "agent" }>`
  align-self: ${({ $origin }) => ($origin === "user" ? "flex-end" : "flex-start")};
  background: ${({ $origin, theme }) => ($origin === "user" ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $origin }) => ($origin === "user" ? "#ffffff" : "#1a1a1a")};
  padding: 14px 18px;
  border-radius: 18px;
  max-width: 70%;
  line-height: 1.6;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  border: ${({ $origin, theme }) => ($origin === "agent" ? `1px solid ${theme.colors.muted}33` : "none")};
  
  /* Estilos para markdown renderizado */
  p {
    margin: 0.5em 0;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    font-weight: 600;
  }
  
  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  
  code {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
`;

const MessageMeta = styled.span`
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 6px;
`;

// Função para formatar timestamp com segurança
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleString('pt-BR');
    }
    return date.toLocaleString('pt-BR');
  } catch {
    return new Date().toLocaleString('pt-BR');
  }
}

const Form = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const Input = styled.textarea`
  flex: 1;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 12px 16px;
  min-height: 90px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  background: #fdfdfd;
`;

const Button = styled.button`
  border-radius: 12px;
  border: none;
  padding: 16px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(31, 60, 136, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export function ChatPanel({ messages, onMessagesChange, sessionId, onSessionChange, currentState, onStateChange, onPromotionCompleted, onPromotionConfirmed }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const currentSession = sessionId;

  // Função para determinar se deve esconder a mensagem da IA
  const shouldHideMessage = (message: ChatMessage): boolean => {
    // Nunca esconde mensagens do usuário
    if (message.role !== 'agent') return false;
    
    // Nunca esconde se não há dados estruturados
    if (!currentState?.data) return false;
    
    // Esconde mensagens longas da IA quando há dados estruturados
    const hasStructuredData = currentState.data.multiple_promotions?.length > 0 ||
                             currentState.data.titulo ||
                             currentState.data.periodo_inicio;
    
    if (!hasStructuredData) return false;
    
    // ✅ NOVO: Verifica se dados estão completos
    const hasMultiple = currentState.data.multiple_promotions?.length > 0;
    const dataToCheck = hasMultiple 
      ? currentState.data.multiple_promotions 
      : currentState.data;
    
    const isComplete = hasMultiple
      ? areAllPromotionsComplete(dataToCheck)
      : isPromotionComplete(dataToCheck);
    
    // Só esconde mensagens longas se dados estiverem COMPLETOS
    // Se incompleto, usuário precisa das instruções da IA
    return isComplete && message.content.length > 200;
  };

  // Função para fazer download do Excel
  const downloadExcel = (base64: string, filename: string) => {
    try {
      // Converte base64 para blob
      const byteCharacters = atob(base64);
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
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download do Excel iniciado:', filename);
    } catch (error) {
      console.error('❌ Erro ao fazer download do Excel:', error);
    }
  };

  // Monitora mudanças no estado para detectar excel_base64
  useEffect(() => {
    if (currentState?.data?.excel_base64 && currentState?.data?.excel_filename) {
      console.log('📊 Excel detectado no estado, iniciando download...');
      downloadExcel(currentState.data.excel_base64, currentState.data.excel_filename);
      
      // Remove o excel do estado após download para não baixar novamente
      if (onStateChange) {
        const newState = { ...currentState };
        delete newState.data.excel_base64;
        delete newState.data.excel_filename;
        onStateChange(newState);
      }
    }
  }, [currentState]);

  const handleNewPromotion = () => {
    // Limpa as mensagens do chat
    onMessagesChange([]);
    // Gera um novo session ID
    const newSessionId = crypto.randomUUID();
    onSessionChange(newSessionId);
    // Limpa o estado
    if (onStateChange) {
      onStateChange(null);
    }
    // Limpa o localStorage
    localStorage.setItem("promoagente-session", newSessionId);
  };

  // ✅ Função para confirmar promoção(ões) - envia tudo de uma vez ao backend
  const handleConfirm = async (promotionData: any) => {
    console.log('✅ Confirmando promoção(ões):', promotionData);
    setIsSending(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://promo-functions-cpa5ajcfftdgawc2.canadacentral-01.azurewebsites.net';
      
      // Detecta se é múltiplas promoções (array) ou única (objeto)
      const isMultiple = Array.isArray(promotionData);
      
      // Adiciona session_id a cada promoção
      let dataToSend;
      if (isMultiple) {
        dataToSend = promotionData.map(promo => ({ ...promo, session_id: currentSession }));
      } else {
        dataToSend = { ...promotionData, session_id: currentSession };
      }
      
      console.log(`📤 Enviando ${isMultiple ? dataToSend.length : 1} promoção(ões) para /api/confirm`);
      console.log('📤 Payload:', dataToSend);
      
      const response = await fetch(`${apiBaseUrl}/api/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      console.log(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('📥 Error response body:', errorText);
        } catch (e) {
          console.error('Não foi possível ler o corpo do erro');
        }
        throw new Error(`Erro ${response.status}: ${errorText.substring(0, 300)}`);
      }

      const result = await response.json();
      console.log('📥 Response:', result);
      
      // Extrai promoções salvas
      const savedPromotions = result.promotions || (result.promotion ? [result.promotion] : []);
      const totalSaved = result.total_saved || savedPromotions.length;
      const totalErrors = result.total_errors || 0;
      
      if (totalSaved > 0) {
        // Mensagem de sucesso
        let successContent = `✅ **${totalSaved} promoção(ões) confirmada(s) e salva(s) com sucesso!**`;
        
        if (totalErrors > 0 && result.errors) {
          const errorTitles = result.errors.map((e: any) => e.titulo).join(', ');
          successContent += `\n\n⚠️ ${totalErrors} falha(s): ${errorTitles}`;
        }
        
        const successMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "agent",
          content: successContent,
          timestamp: new Date().toISOString()
        };
        onMessagesChange([...messages, successMessage]);

        // Adiciona ao histórico da sessão
        if (onPromotionConfirmed) {
          savedPromotions.forEach((promo: any) => onPromotionConfirmed(promo));
        }

        // Limpa o preview
        if (onStateChange) {
          onStateChange(null);
        }
      } else {
        throw new Error('Nenhuma promoção foi salva com sucesso');
      }

    } catch (error) {
      console.error('❌ Erro ao confirmar promoção:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: `❌ Erro ao confirmar promoção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: new Date().toISOString()
      };
      onMessagesChange([...messages, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleExportExcel = async () => {
    setIsSending(true);
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: "gerar excel",
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, userMessage];
    onMessagesChange(updated);

    try {
      const response = await sendChatMessage("gerar excel", currentSession, currentState);

      const agentMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: response.response,
        timestamp: response.timestamp
      };

      onMessagesChange([...updated, agentMessage]);
      
      if (response.state && onStateChange) {
        onStateChange(response.state);
      }
    } catch (error) {
      console.error("Erro ao exportar Excel", error);
    } finally {
      setIsSending(false);
    }
  };

  // ✅ NOVO: Handler para Enter/Shift+Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Se apertar Enter sem Shift, envia a mensagem
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as any);
    }
    // Se apertar Shift+Enter, permite quebra de linha (comportamento padrão)
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, userMessage];
    onMessagesChange(updated);
    setInput("");
    setIsSending(true);

    try {
      // Envia mensagem COM o estado atual
      const response = await sendChatMessage(trimmed, currentSession, currentState);

      const agentMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: response.response,
        timestamp: response.timestamp
      };

      onMessagesChange([...updated, agentMessage]);
      
      // Atualiza session_id se mudou
      if (response.session_id && response.session_id !== currentSession) {
        onSessionChange(response.session_id);
      }
      
      // Atualiza o estado recebido do backend
      if (response.state && onStateChange) {
        onStateChange(response.state);
      }

      // Detecta se a promoção foi concluída/salva
      // Verifica status "ready" OU mensagens específicas
      const isCompleted = response.status === "ready" || 
                         response.response.includes("Promoção validada e pronta") ||
                         response.response.includes("Promoção enviada com sucesso") || 
                         response.response.includes("Promoção salva no sistema");
      
      if (onPromotionCompleted && isCompleted) {
        console.log('✅ Promoção concluída detectada! Recarregando lista em 1s...');
        // Aguarda um pouco para garantir que o backend salvou
        setTimeout(() => {
          onPromotionCompleted();
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem", error);
    } finally {
      setIsSending(false);
    }
  };

  // Verifica se a promoção está pronta para exportar
  const isReadyToExport = currentState?.status === "ready";
  
  // DEBUG: Log do estado atual
  console.log('🔍 ChatPanel - currentState:', currentState);
  console.log('🔍 ChatPanel - status:', currentState?.status);
  console.log('🔍 ChatPanel - isReadyToExport:', isReadyToExport);

  return (
    <ChatWrapper>
      <ChatHeader>
        <Title>PromoAgente chat</Title>
        <ButtonGroup>
          <NewPromotionButton onClick={handleNewPromotion}>
            ✨ Nova Promoção
          </NewPromotionButton>
        </ButtonGroup>
      </ChatHeader>
      <ScrollArea>
        {/* ✅ SEMPRE mostra todas as mensagens (user e agent) */}
        {messages.map(message => (
          <MessageBubble key={message.id} $origin={message.role}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
            <MessageMeta>{formatTimestamp(message.timestamp)}</MessageMeta>
          </MessageBubble>
        ))}
        
        {/* Preview de dados coletados - APARECE POR ÚLTIMO, após todas as mensagens */}
        {currentState?.data && (() => {
          // Verifica se há múltiplas promoções no estado
          const hasMultiple = currentState.data.multiple_promotions && 
                             Array.isArray(currentState.data.multiple_promotions) && 
                             currentState.data.multiple_promotions.length > 1;
          
          const dataToShow = hasMultiple 
            ? currentState.data.multiple_promotions 
            : currentState.data;
          
          // ✅ NOVO: Verifica completude dos dados
          let isComplete = false;
          
          if (hasMultiple) {
            // Múltiplas: só completo se TODAS estiverem completas
            isComplete = areAllPromotionsComplete(dataToShow);
          } else {
            // Única: verifica se está completa
            isComplete = isPromotionComplete(dataToShow);
          }
          
          console.log('🔍 Dados - hasMultiple:', hasMultiple);
          console.log('🔍 Dados - isComplete:', isComplete);
          console.log('🔍 Dados - dataToShow:', dataToShow);
          
          // Renderiza preview apenas quando completo e validado
          // Status: draft/gathering = NÃO mostra preview
          // Status: validated/ready = mostra preview com botões
          const status = currentState?.status;
          const shouldShowPreview = isComplete && (status === 'validated' || status === 'ready');
          
          if (shouldShowPreview) {
            // ✅ Dados completos e validados → Mostra preview estruturado
            return (
              <PromotionPreview 
                data={dataToShow}
                isMultiple={hasMultiple}
                onExportExcel={handleExportExcel}
                onConfirm={() => handleConfirm(dataToShow)}
              />
            );
          } else {
            // ⚠️ Dados incompletos ou em coleta → Não mostra preview
            // Usuário vê apenas as mensagens do agente
            return null;
          }
        })()}
      </ScrollArea>
      <Form onSubmit={handleSubmit}>
        <Input
          id="chat-message-input"
          name="message"
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Descreva a promoção ou peça uma sugestão ao agente (Enter para enviar, Shift+Enter para nova linha)"
          autoComplete="off"
        />
        <Button type="submit" disabled={isSending}>
          {isSending ? "Enviando..." : "Enviar"}
        </Button>
      </Form>
    </ChatWrapper>
  );
}
