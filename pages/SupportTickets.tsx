import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { cn } from "../lib/utils";
import { 
  ChevronLeft, 
  Paperclip, 
  Send, 
  X, 
  CheckCheck,
  MoreVertical,
  ArrowDown,
  Loader2,
  ShieldCheck,
  Info,
  Download
} from 'lucide-react';

const FORBIDDEN_WORDS = Array.from(new Set([
  "burla", "burlas", "fraude", "fraudes", "scam", "scams", "golpe", "golpes", 
  "ladrão", "ladrao", "ladrões", "ladroes", "roubo", "roubos", "bosta", "bostas", 
  "merda", "merdas", "caralho", "caralhos", "foda", "fodas", "fodase", "foda-se", 
  "porra", "porras", "puta", "putas", "puta que pariu", "filho da puta", "fdp", 
  "cabrao", "cabrão", "cabroes", "cabrões", "corno", "cornos", "vagabundo", "vagabundos", 
  "desgraçado", "desgracado", "desgraçados", "animal", "animais", "idiota", "idiotas", 
  "imbecil", "imbecis", "otario", "otário", "otarios", "otários", "retardado", "retardados", 
  "estupido", "estúpido", "estupidos", "estúpidos", "palhaço", "palhaco", "palhaços", "palhacos", 
  "lixo", "lixos", "nojento", "nojentos", "maldito", "malditos", "cão", "cao", "macaco", "macacos",
  "burro", "burros", "cala boca", "vai se ferrar", "vai te ferrar", "vai morrer",
  "sexo", "nude", "nudes", "porn", "porno", "pornografia", "pênis", "penis", 
  "piroca", "pirocas", "cona", "conas", "vagina", "buceta", "bucetas", "cu", "cus", 
  "rabeta", "mamar", "chupar", "mata", "morrer", "suicida", "suicidio", "terrorista", "nazista", "racista",
  "vou denunciar", "vou processar", "processo", "crime", "polícia", "policia", 
  "tribunal", "interpol", "cadeia", "prisão", "prisao", "fbi", "investigação", "investigacao",
  "viado", "viados", "gayzinho", "bicha", "bichas", "boiola", "sapatão", "sapatao",
  "golpista", "golpistas", "burlador", "burladores", "fraudador", "fraudadores", 
  "scammer", "scammers", "pirâmide", "piramide", "esquema ponzi", "ponzi", 
  "roubaram", "roubaste", "roubado", "roubando", "empresa falsa", "site falso", 
  "aplicativo falso", "app falso", "fake", "farsa", "enganador", "enganadora", 
  "trapaceiro", "vigarista", "171", "mafioso", "máfia", "mafia",
  "admin ladrão", "admin ladrao", "suporte lixo", "suporte inútil", "suporte inutil", 
  "admin inútil", "admin inutil", "adm corrupto", "admin corrupto", "moderador corrupto", 
  "staff lixo", "staff incompetente", "empresa corrupta", "empresa de ladrões", "empresa de ladroes", 
  "dono ladrão", "dono ladrao", "vocês roubam", "voces roubam", "estão roubando", "estao roubando", 
  "vocês são burlões", "voces sao burloes",
  "não paga", "nao paga", "não pagam", "nao pagam", "perdi dinheiro", "perdi tudo", 
  "não recebi", "nao recebi", "sumiram com dinheiro", "bloquearam saque", "não consigo sacar", 
  "nao consigo sacar", "site caiu", "empresa faliu", "empresa vai fechar", "vai fechar", 
  "quebrou", "falida", "falido", "sistema roubando", "dinheiro preso", "não vale nada", "nao vale nada",
  "ganha dinheiro rapido", "dinheiro facil", "hack", "hacker", "clonar", 
  "cartão roubado", "cartao roubado", "bitcoin gratis", "investimento falso",
  "entra no meu link", "usa meu link", "me chama no privado", "grupo fake", "grupo falso", 
  "tenho hack", "hack saque", "hack sistema", "bug de saque", "método secreto", "metodo secreto", 
  "ganhar sem investir", "dinheiro fácil", "lucro garantido", "100% garantido",
  "não confiem", "nao confiem", "não invistam", "nao invistam", "isso é golpe", "isso e golpe", 
  "empresa scam", "site scam", "app scam", "plataforma scam", "plataforma falsa", "empresa fake", 
  "saque falso", "pagamento falso"
]));

const ESCAPED_FORBIDDEN = FORBIDDEN_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const FORBIDDEN_REGEX = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${ESCAPED_FORBIDDEN.join('|')})(?:[^\\p{L}\\p{N}]|$)`, 'iu');

const CONTEXT_GROUPS: Record<string, { path: string, keywords: string[] }> = {
  Home: { path: "/home", keywords: ["home", "início", "inicio", "pagina inicial", "painel", "dashboard"] },
  Withdraw: { path: "/retirada", keywords: ["saque", "sacar", "retirada", "retirar", "levantamento", "levantar dinheiro", "withdraw", "withdrawal", "retrait", "retirer"] },
  Recharge: { path: "/recarregar", keywords: ["recarga", "recarregar", "depósito", "depositar", "recharge"] },
  Invite: { path: "/convite", keywords: ["convite", "convidar", "amigo", "afiliado", "indicar"] },
  Support: { path: "/suporte", keywords: ["suporte", "ajuda", "atendimento", "help"] },
  Operations: { path: "/operacoes", keywords: ["operações", "operacoes", "trabalho", "tarefa", "tarefas"] },
  ProductDetails: { path: "/produtos", keywords: ["produto", "investimento", "plano", "lucro"] }
};

const KEYWORD_TO_PATH: Record<string, string> = {};
Object.values(CONTEXT_GROUPS).forEach(group => {
  group.keywords.forEach(kw => {
    KEYWORD_TO_PATH[kw.toLowerCase()] = group.path;
  });
});

const ALL_KEYWORDS_SORTED = Object.keys(KEYWORD_TO_PATH).sort((a, b) => b.length - a.length);
const SMART_CONTEXT_REGEX = new RegExp(`(${ALL_KEYWORDS_SORTED.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

const translationCache = new Map<string, string>();
const translationQueue: (() => Promise<void>)[] = [];
let isTranslating = false;

const processTranslationQueue = async () => {
  if (isTranslating) return;
  isTranslating = true;
  while (translationQueue.length > 0) {
    const task = translationQueue.shift();
    if (task) {
      await task();
      await new Promise(r => setTimeout(r, 100));
    }
  }
  isTranslating = false;
};

const translateTextAPI = (text: string, lang: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!text || text.trim() === '') return resolve(text);
    const cacheKey = `${lang}:${text}`;
    if (translationCache.has(cacheKey)) return resolve(translationCache.get(cacheKey)!);
    
    translationQueue.push(async () => {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json && json[0]) {
          const result = json[0].map((item: any) => item[0]).join('');
          translationCache.set(cacheKey, result);
          resolve(result);
        } else resolve(text);
      } catch {
        resolve(text);
      }
    });
    processTranslationQueue();
  });
};

const TranslatedMessage = ({ text, language, renderFormatted }: { text: string, language: string, renderFormatted: (t: string) => React.ReactNode }) => {
  const [translated, setTranslated] = useState<string>(text);

  useEffect(() => {
    let isMounted = true;
    if (!text) return;
    
    if (language === 'pt') {
       setTranslated(text);
       return;
    }

    setTranslated(translationCache.get(`${language}:${text}`) || text);

    translateTextAPI(text, language).then(result => {
      if (isMounted) setTranslated(result);
    });

    return () => { isMounted = false; };
  }, [text, language]);

  return <>{renderFormatted(translated)}</>;
};

const USER_COLORS = [
  "#229ED9", "#E56555", "#8E44AD", "#27AE60", "#D35400", "#16A085", "#C0392B", "#2980B9"
];

function getUserColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export default function SupportTickets() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const user = session?.user;
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [publicInput, setPublicInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [reactionMenuId, setReactionMenuId] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const EMOJIS = [
    { char: "👍", label: "Gosto" },
    { char: "❤️", label: "Adoro" },
    { char: "🔥", label: "Fogo" },
    { char: "😂", label: "Riso" },
    { char: "😮", label: "Surpresa" },
    { char: "😢", label: "Tristeza" },
    { char: "🙏", label: "Grato" }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: behavior
        });
      }
    }, 100);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollDown(!isAtBottom);
    }
  };

  const renderFormattedMessage = (text: string) => {
    if (!text) return null;
    const parts = text.split(SMART_CONTEXT_REGEX);
    const usedGroups = new Set<string>();

    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      const path = KEYWORD_TO_PATH[lowerPart];
      
      if (path && !usedGroups.has(path)) {
        usedGroups.add(path);
        return (
          <span 
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              navigate(path);
            }}
            className="text-[#229ED9] font-medium underline cursor-pointer hover:opacity-80 transition-opacity"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const fetchMessages = async (isInitial = false) => {
    try {
      const { data, error } = await supabase.rpc('get_chat_messages_mcpn', { p_limit: 60 });

      if (error) throw error;

      if (data) {
        const dataWithPhones = data.map((m: any) => ({
          ...m,
          perfis_mcpn: { telefone: m.telefone || "Membro" }
        }));

        const sortedData = dataWithPhones.reverse();
        setPublicMessages(prev => {
          const msgMap = new Map();
          prev.forEach(m => msgMap.set(m.id, m));
          sortedData.forEach(m => msgMap.set(m.id, m));
          return Array.from(msgMap.values()).sort((a, b) => 
            new Date(a.data_registrada).getTime() - new Date(b.data_registrada).getTime()
          );
        });
        
        if (isInitial) scrollToBottom("auto");
      }
    } catch {
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    pollingRef.current = setInterval(() => fetchMessages(false), 2500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("addbank_telegram_chat_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_gruop" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          setPublicMessages(prev => prev.filter(m => m.id !== payload.old.id));
          return;
        }
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const { data } = await supabase.from("chat_gruop").select(`*`).eq("id", payload.new.id).single();
          if (data) { 
            let telefone = "Membro";
            if (data.uid_emissor) {
              const { data: phoneData } = await supabase.rpc('get_sender_phone_mcpn', { p_uid: data.uid_emissor });
              if (phoneData) telefone = phoneData;
            }
            const dataWithPhone = { ...data, perfis_mcpn: { telefone } };
            setPublicMessages((c) => {
              const msgMap = new Map(c.map(m => [m.id, m]));
              msgMap.set(data.id, dataWithPhone);
              return Array.from(msgMap.values()).sort((a, b) => 
                new Date(a.data_registrada).getTime() - new Date(b.data_registrada).getTime()
              );
            }); 
            if (payload.eventType === "INSERT" && scrollRef.current) scrollToBottom();
          }
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const validateMessage = (text: string) => {
    if (text.length > 2000) return "A mensagem é muito longa.";
    if (FORBIDDEN_REGEX.test(text)) return "Por favor, evite termos ofensivos.";
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    const matches = text.match(urlRegex);
    if (matches) {
      const allowed = ['azure', 'mcn', 'aliexpress24', 't.me'];
      if (matches.some(m => !allowed.some(d => m.toLowerCase().includes(d))))
        return "Não são permitidos links externos.";
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Máximo 5MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!user || (!publicInput.trim() && !imagePreview)) return;
    if (publicInput.trim()) {
      const err = validateMessage(publicInput.trim());
      if (err) { showToast(err, "error"); return; }
    }
    const tempMsg = publicInput.trim();
    const tempImg = imagePreview;
    const tempReply = replyTo;
    const reacoesJson = tempReply ? JSON.stringify({ reply: { id: tempReply.id, text: tempReply.mensagem, sender: tempReply.perfis_mcpn?.telefone || "Membro" } }) : "";

    setPublicInput("");
    setImagePreview(null);
    setReplyTo(null);
    if (inputRef.current) inputRef.current.style.height = "auto";

    setIsSending(true);
    try {
      await supabase.from("chat_gruop").insert([{
        uid_emissor: user.id,
        mensagem: tempMsg || "",
        reacoes_emojis: reacoesJson,
        url_imagen_conversa: tempImg || "",
      }]);
      scrollToBottom();
    } catch { 
      showToast("Erro ao enviar mensagem.", "error"); 
      setPublicInput(tempMsg);
      setImagePreview(tempImg);
    } finally { 
      setIsSending(false); 
    }
  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    if (!user) return;
    setReactionMenuId(null);
    try {
      await supabase.rpc('toggle_reaction_mcpn', {
        p_message_id: messageId,
        p_emoji: emoji,
        p_user_id: user.id
      });
    } catch {
    }
  };

  const handleLongPressStart = (id: number) => {
    const timer = setTimeout(() => {
      setReactionMenuId(id);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => { if (longPressTimer) clearTimeout(longPressTimer); };

  const formatTime = (ts: string) => ts ? new Date(ts).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "";
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
  };

  const formatSenderPhone = (p: string) => {
    if (!p || p === "Membro") return "Membro";
    const clean = p.replace(/^\+?244\s*/, '').trim();
    if (/^\d{9}$/.test(clean)) {
      return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return clean;
  };

  const handleDownloadImage = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagem_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Download concluído!', 'success');
    } catch {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `imagem_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-[#F2F2F2] flex flex-col items-center justify-center font-sans antialiased text-[#202020]">
      <Loader2 className="w-6 h-6 animate-spin text-[#229ED9]" />
      <span className="text-[12.5px] text-[#666666] mt-2 font-normal">A carregar chat...</span>
    </div>
  );

  return (
    <div className="w-full h-[100dvh] bg-[#F2F2F2] font-sans antialiased text-[#202020] select-none flex flex-col items-center overflow-hidden">
      
      <header className="w-full max-w-[480px] bg-white px-4 pt-3 pb-2.5 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <button 
            onClick={() => navigate('/home')} 
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          
          <div 
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 rounded-none bg-[#229ED9] flex items-center justify-center text-white shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current ml-[-1px]" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.949z"/>
            </svg>
          </div>

          <div 
            onClick={() => setShowInfo(true)}
            className="flex flex-col min-w-0 cursor-pointer flex-1"
          >
            <div className="flex items-center gap-1.5">
              <h1 className="text-[14px] font-medium text-[#202020] tracking-normal truncate leading-tight">
                Telegram AliExpress24
              </h1>
              <div className="w-3.5 h-3.5 bg-[#229ED9] text-white flex items-center justify-center rounded-full shrink-0" title="Conta Verificada">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
            </div>
            <span className="text-[11px] text-[#229ED9] font-normal leading-tight">
              On-line
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowInfo(true)} 
          className="p-1 text-[#888888] hover:text-[#202020] active:scale-95 transition-transform cursor-pointer"
          aria-label="Mais informações"
        >
          <MoreVertical className="w-4.5 h-4.5" />
        </button>
      </header>

      <main 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="w-full max-w-[480px] flex-1 overflow-y-auto no-scrollbar px-3.5 pt-3 pb-24 space-y-2.5 bg-[#F2F2F2] relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {publicMessages.map((m, i) => {
          const isMe = m.uid_emissor === user?.id;
          const phone = m.perfis_mcpn?.telefone || "Membro";
          const showDate = i === 0 || formatDateLabel(m.data_registrada) !== formatDateLabel(publicMessages[i-1].data_registrada);
          const authorColor = getUserColor(phone);

          let parsedData: any = {};
          try { if (m.reacoes_emojis) parsedData = JSON.parse(m.reacoes_emojis); } catch {}
          const reply = parsedData.reply;
          const reactions = parsedData.reactions || {};

          return (
            <React.Fragment key={m.id}>
              {showDate && (
                <div className="flex justify-center my-2.5">
                  <span className="text-[10.5px] font-normal text-[#777777] bg-white border border-gray-200/60 rounded-none px-2.5 py-0.5 shadow-2xs">
                    {formatDateLabel(m.data_registrada)}
                  </span>
                </div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} relative`}
              >
                <AnimatePresence>
                  {reactionMenuId === m.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: -38 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`absolute z-[100] bg-white rounded-none px-1.5 py-1 flex gap-1 shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-gray-200 ${isMe ? 'right-0' : 'left-0'}`}
                    >
                      {EMOJIS.map(e => (
                        <button 
                          key={e.char} 
                          onClick={() => handleToggleReaction(m.id, e.char)} 
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-none transition-all active:scale-110 text-[15px] cursor-pointer"
                        >
                          {e.char}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  onPointerDown={() => handleLongPressStart(m.id)}
                  onPointerUp={handleLongPressEnd}
                  onPointerLeave={handleLongPressEnd}
                  onDoubleClick={() => setReplyTo(m)}
                  className={cn(
                    "max-w-[85%] px-3 py-2 text-[#202020] rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] border relative select-text",
                    isMe 
                      ? "bg-[#EFFDDE] border-[#D6F0BD]" 
                      : "bg-white border-gray-100/80"
                  )}
                >
                  {!isMe && (
                    <p 
                      className="text-[12px] font-medium mb-1 cursor-pointer truncate"
                      style={{ color: authorColor }}
                    >
                      {formatSenderPhone(phone)}
                    </p>
                  )}

                  {reply && (
                    <div className={cn(
                      "rounded-none px-2 py-1 mb-1.5 text-[11px] border-l-2 bg-black/5 overflow-hidden",
                      isMe ? "border-[#229ED9] text-[#444444]" : "border-[#229ED9] text-[#555555]"
                    )}>
                      <p className="font-medium text-[10.5px] text-[#229ED9] truncate">{formatSenderPhone(reply.sender)}</p>
                      <p className="truncate italic text-[10.5px] text-[#666666]">{reply.text || "📷 Foto"}</p>
                    </div>
                  )}

                  {m.url_imagen_conversa && (
                    <div className="mb-1.5 -mx-1 -mt-0.5 overflow-hidden rounded-none border border-gray-200/50">
                      <img
                        src={m.url_imagen_conversa}
                        alt="Anexo"
                        className="w-full h-auto max-h-[260px] object-cover cursor-pointer active:opacity-90 rounded-none"
                        onClick={() => setZoomedImage(m.url_imagen_conversa)}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap pr-12 text-[#202020] font-normal">
                      <TranslatedMessage text={m.mensagem} language={language} renderFormatted={renderFormattedMessage} />
                    </p>
                    
                    <div className="absolute right-0 bottom-[-2px] flex items-center gap-0.5 select-none">
                      <span className="text-[9.5px] text-[#888888] font-normal">
                        {formatTime(m.data_registrada)}
                      </span>
                      {isMe && (
                        <CheckCheck className="w-3 h-3 text-[#229ED9] stroke-[2.2]" />
                      )}
                    </div>
                  </div>

                  {Object.keys(reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/5">
                      {Object.entries(reactions).map(([emoji, users]: [string, any]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleToggleReaction(m.id, emoji)}
                          className="bg-white border border-gray-200 rounded-none px-1.5 py-0.2 flex items-center gap-1 shadow-2xs hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <span className="text-[10.5px]">{emoji}</span>
                          <span className="text-[9.5px] font-medium text-[#555555]">{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </main>

      <AnimatePresence>
        {showScrollDown && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 right-5 w-8 h-8 bg-white text-[#202020] rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.15)] flex items-center justify-center z-40 active:scale-90 transition-transform cursor-pointer border border-gray-200"
            aria-label="Rolar para o fundo"
          >
            <ArrowDown className="w-4 h-4 stroke-[2]" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-2.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px] flex flex-col gap-1.5">
          <AnimatePresence>
            {replyTo && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="bg-white border-l-2 border-[#229ED9] rounded-none px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex justify-between items-center"
              >
                <div className="truncate flex-1">
                  <p className="text-[11px] font-medium text-[#229ED9]">
                    A responder a {formatSenderPhone(replyTo.perfis_mcpn?.telefone || "Membro")}
                  </p>
                  <p className="text-[11px] text-[#777777] truncate italic">
                    <TranslatedMessage text={replyTo.mensagem} language={language} renderFormatted={(t: string) => t || 'Foto'} />
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)} 
                  className="text-[#AAAAAA] hover:text-[#202020] p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-1.5">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
            />

            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              className="w-[40px] h-[40px] bg-white rounded-none flex items-center justify-center text-[#777777] hover:text-[#202020] active:scale-95 transition-colors shrink-0 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100/60"
              title="Anexar foto"
            >
              <Paperclip className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            <div className="flex-1 bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100/60 flex flex-col overflow-hidden min-h-[40px]">
              {imagePreview && (
                <div className="p-2 pb-0 relative">
                  <img src={imagePreview} alt="preview" className="w-12 h-12 object-cover rounded-none border border-gray-200" />
                  <button 
                    type="button"
                    onClick={() => setImagePreview(null)} 
                    className="absolute top-1 left-9 bg-black/70 text-white rounded-none p-0.5 hover:bg-black cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
              <textarea
                ref={inputRef}
                value={publicInput}
                onChange={(e) => {
                  setPublicInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  } 
                }}
                placeholder="Mensagem..."
                className="w-full px-3 py-2.5 text-[13px] bg-transparent resize-none outline-none max-h-[100px] text-[#202020] placeholder:text-[#AAAAAA] font-normal"
                rows={1}
              />
            </div>

            <button 
              type="button"
              onClick={handleSend}
              disabled={isSending || (!publicInput.trim() && !imagePreview)}
              className="w-[42px] h-[40px] rounded-none bg-[#229ED9] hover:bg-[#1D8BC3] text-white flex items-center justify-center active:scale-[0.99] disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-none"
              title="Enviar"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white ml-0.5 stroke-[2]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <div 
            className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" 
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-none w-full max-w-[380px] p-4 shadow-xl relative border border-gray-100" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-[14px] font-medium text-[#202020]">Detalhes do Canal</h2>
                <button 
                  type="button"
                  onClick={() => setShowInfo(false)} 
                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="pt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#229ED9] flex items-center justify-center text-white shrink-0">
                    <svg className="w-5 h-5 fill-current ml-[-1px]" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.949z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[13.5px] font-medium text-[#202020]">Telegram AliExpress24</h3>
                      <div className="w-3.5 h-3.5 bg-[#229ED9] text-white flex items-center justify-center rounded-full shrink-0">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#229ED9]">Canal Oficial Verificado</p>
                  </div>
                </div>

                <div className="bg-[#F2F2F2] rounded-none p-3 space-y-1.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Tipo:</span>
                    <span className="font-medium text-[#202020]">Canal Oficial</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Moderação:</span>
                    <span className="font-medium text-emerald-600">Ativa 24/7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666]">Troca de Fotos:</span>
                    <span className="font-medium text-[#229ED9]">Habilitada</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="w-full h-[38px] rounded-none bg-white border border-gray-200 text-[#444444] text-[13px] hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-2" 
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} className="max-w-full max-h-full object-contain rounded-none" alt="Zoom" />
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button 
                type="button"
                className="text-white p-2 hover:bg-white/10 rounded-none cursor-pointer flex items-center justify-center transition-colors"
                onClick={(e) => handleDownloadImage(zoomedImage, e)}
                title="Baixar imagem"
              >
                <Download className="w-6 h-6 stroke-[1.8]" />
              </button>
              <button 
                type="button"
                className="text-[#FE384F] hover:text-[#E02E44] p-2 hover:bg-white/10 rounded-none cursor-pointer flex items-center justify-center transition-colors"
                onClick={() => setZoomedImage(null)}
                title="Fechar"
              >
                <X className="w-6 h-6 stroke-[2]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
