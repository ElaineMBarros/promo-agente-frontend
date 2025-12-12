import { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Layout } from "./components/Layout";
import { ChatPanel } from "./components/ChatPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { StatusBar } from "./components/StatusBar";
import { fetchStatus, fetchPromotions } from "./services/api";
import { ChatMessage, PromotionRecord, SystemStatus } from "./types";

const theme = {
  colors: {
    background: "#ffffff",
    surface: "#f5f7fa",
    primary: "#1f3c88",
    primaryDark: "#1a3170",
    secondary: "#4f6d7a",
    accent: "#00a8e8",
    text: "#1a1a1a",
    muted: "#6f7a8a"
  }
};

function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [history, setHistory] = useState<PromotionRecord[]>([]);
  const [sessionHistory, setSessionHistory] = useState<PromotionRecord[]>([]); // ✅ NOVO: Histórico da sessão atual
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    return localStorage.getItem("promoagente-session") || undefined;
  });
  const [currentState, setCurrentState] = useState<any>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetchStatus();
        setStatus(response);
      } catch (error) {
        console.error("Erro ao carregar status", error);
      }
    };

    loadStatus();
    // ❌ REMOVIDO: loadHistory() - Não buscar mais do banco no início
    // ✅ sessionHistory começa vazio e é preenchido ao confirmar promoções
  }, []);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("promoagente-session", sessionId);
    }
  }, [sessionId]);

  // ✅ NOVO: Função para adicionar promoção confirmada ao histórico da sessão
  const addToSessionHistory = (promotion: PromotionRecord) => {
    console.log('📋 Adicionando promoção ao histórico da sessão:', promotion.titulo);
    setSessionHistory(prev => [...prev, promotion]);
  };

  // ✅ NOVO: Função para atualizar promoção existente no histórico da sessão
  const updateSessionPromotion = (updatedPromotion: PromotionRecord) => {
    console.log('🔄 Atualizando promoção no histórico da sessão:', updatedPromotion.titulo);
    setSessionHistory(prev => 
      prev.map(p => p.id === updatedPromotion.id ? updatedPromotion : p)
    );
  };

  // ✅ NOVO: Função para limpar histórico da sessão ao criar nova sessão
  const handleSessionChange = (newSessionId: string) => {
    console.log('🔄 Nova sessão criada, limpando histórico:', newSessionId);
    setSessionId(newSessionId);
    setSessionHistory([]); // Limpa histórico ao criar nova sessão
  };

  const reloadHistory = async () => {
    try {
      const records = await fetchPromotions();
      setHistory(records);
    } catch (error) {
      console.error("Erro ao recarregar histórico", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout
        header={<StatusBar status={status} />}
        sidebar={
          <HistoryPanel 
            records={sessionHistory}  // ✅ MUDADO: Usar sessionHistory ao invés de history
            sessionId={sessionId}
            onPromotionUpdated={updateSessionPromotion}  // ✅ NOVO: Callback para atualizar promoção
          />
        }
        main={
          <ChatPanel 
            messages={messages} 
            onMessagesChange={setMessages} 
            sessionId={sessionId} 
            onSessionChange={handleSessionChange}  // ✅ MUDADO: Usar handleSessionChange para limpar histórico
            currentState={currentState}
            onStateChange={setCurrentState}
            onPromotionConfirmed={addToSessionHistory}  // ✅ NOVO: Callback ao confirmar
          />
        }
      />
    </ThemeProvider>
  );
}

export default App;
