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
  Info, 
  Plus, 
  Send, 
  X, 
  Image as ImageIcon,
  Check,
  CheckCheck,
  MoreVertical,
  Smile,
  ArrowDown,
  Loader2,
  Activity
} from 'lucide-react';

// ==========================================
// LISTA DE MODERAÇÃO DE CHAT
// ==========================================
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

// ==========================================
// TRADUÇÃO DE MENSAGENS EM TEMPO REAL
// ==========================================
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
      await new Promise(r => setTimeout(r, 100)); // Delay to prevent rate limit (429)
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
      } catch (e) {
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

export default function SupportTickets() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const user = session?.user;
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [publicInput, setPublicInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userPhone, setUserPhone] = useState("");
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
            className="text-[#C62828] font-bold underline cursor-pointer hover:opacity-80 transition-opacity"
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
      // Usamos uma query simples para evitar disparar interceptores de loading global se existirem
      const { data, error } = await supabase.from("chat_gruop")
        .select(`*`)
        .order("data_registrada", { ascending: false })
        .limit(60);

      if (error) throw error;

      if (data) {
        const uids = Array.from(new Set(data.map(m => m.uid_emissor).filter(Boolean)));
        let phoneMap = new Map();
        
        if (uids.length > 0) {
          const { data: perfis } = await supabase.from("perfis_mcpn")
            .select("id, telefone")
            .in("id", uids);
          if (perfis) perfis.forEach(p => phoneMap.set(p.id, p.telefone));
        }

        const dataWithPhones = data.map(m => ({
          ...m,
          perfis_mcpn: { telefone: phoneMap.get(m.uid_emissor) || "Amigo" }
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
    } catch (err) {
      console.error("Falhou, recarregue a pagina", err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    pollingRef.current = setInterval(() => fetchMessages(false), 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("perfis_mcpn").select("telefone").eq("id", user.id).single()
      .then(({ data }) => { if (data) setUserPhone(data.telefone || "Utilizador"); });

    const channel = supabase.channel("public_chat_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_gruop" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          setPublicMessages(prev => prev.filter(m => m.id !== payload.old.id));
          return;
        }
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const { data } = await supabase.from("chat_gruop").select(`*`).eq("id", payload.new.id).single();
          if (data) { 
            let telefone = "Utilizador";
            if (data.uid_emissor) {
              const { data: perfil } = await supabase.from("perfis_mcpn").select("telefone").eq("id", data.uid_emissor).single();
              if (perfil) telefone = perfil.telefone;
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
    if (FORBIDDEN_REGEX.test(text)) return "Por favor,  não ofenda";
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    const matches = text.match(urlRegex);
    if (matches) {
      const allowed = ['microsoft', 'azure', 'mcn'];
      if (matches.some(m => !allowed.some(d => m.toLowerCase().includes(d))))
        return "Não é permitido links externos.";
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
    const reacoesJson = tempReply ? JSON.stringify({ reply: { id: tempReply.id, text: tempReply.mensagem, sender: tempReply.perfis_mcpn?.telefone || "Utilizador" } }) : "";

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
    } catch (err: any) { 
      showToast("Erro ao enviar.", "error"); 
      setPublicInput(tempMsg);
      setImagePreview(tempImg);
    } finally { setIsSending(false); }
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
    } catch (err) { console.error("Erro ao reagir:", err); }
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
    if (days === 0) return t('chat.today');
    if (days === 1) return "Ontem";
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
  };

  const maskPhone = (p: string) => p.replace(/(\d{3})\d+(\d{2})/, "$1****$2");

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-[#1A237E]" />
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-white font-sans overflow-hidden">
      
      {/* Header Premium Flat */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-gray-50">
        <button onClick={() => navigate('/suporte')} className="w-10 h-10 flex items-center justify-start text-[#333333] active:opacity-50 transition-opacity">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center flex-1">
          <h1 className="text-[16px] font-medium text-[#333333] whitespace-nowrap">{t('chat.title')}</h1>
        </div>
        <button onClick={() => setShowInfo(true)} className="w-10 h-10 flex items-center justify-end text-[#333333] active:opacity-50 transition-opacity">
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <main 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-white scroll-smooth"
      >
        {publicMessages.map((m, i) => {
          const isMe = m.uid_emissor === user?.id;
          const phone = m.perfis_mcpn?.telefone || "Utilizador";
          const showDate = i === 0 || formatDateLabel(m.data_registrada) !== formatDateLabel(publicMessages[i-1].data_registrada);
          
          let parsedData: any = {};
          try { if (m.reacoes_emojis) parsedData = JSON.parse(m.reacoes_emojis); } catch {}
          const reply = parsedData.reply;
          const reactions = parsedData.reactions || {};

          return (
            <React.Fragment key={m.id}>
              {showDate && (
                <div className="flex justify-center my-8">
                  <span className="text-[11px] font-light text-gray-400">{formatDateLabel(m.data_registrada)}</span>
                </div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} relative`}
              >
                {/* Reaction Picker Popup */}
                <AnimatePresence>
                  {reactionMenuId === m.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: -50 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`absolute z-[100] bg-white rounded-full p-2 flex gap-1 shadow-xl border border-gray-100 ${isMe ? 'right-0' : 'left-0'}`}
                    >
                      {EMOJIS.map(e => (
                        <button key={e.char} onClick={() => handleToggleReaction(m.id, e.char)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-all active:scale-125 text-xl">
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
                    "max-w-[85%] rounded-[20px] p-3 shadow-none transition-all relative border",
                    isMe 
                      ? "bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white border-transparent rounded-tr-none" 
                      : "bg-gray-50 text-gray-900 border-gray-100 rounded-tl-none"
                  )}
                >
                  {!isMe && (
                    <p className="text-[11px] font-bold text-[#1A237E] mb-1">{maskPhone(phone)}</p>
                  )}

                  {reply && (
                    <div className={cn(
                      "rounded-[12px] p-2 mb-2 text-[11px] border-l-4 bg-black/5 overflow-hidden",
                      isMe ? "border-white/50 text-white/80" : "border-[#1A237E] text-gray-500"
                    )}>
                      <p className="font-bold opacity-70">{reply.sender}</p>
                      <p className="truncate italic">{reply.text || "📷 Imagem"}</p>
                    </div>
                  )}

                  {m.url_imagen_conversa && (
                    <div className="mb-2 -mx-1 -mt-1 overflow-hidden rounded-[14px]">
                      <img
                        src={m.url_imagen_conversa}
                        alt="Anexo"
                        className="w-full h-auto max-h-[300px] object-cover cursor-pointer active:opacity-80"
                        onClick={() => setZoomedImage(m.url_imagen_conversa)}
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">
                      <TranslatedMessage text={m.mensagem} language={language} renderFormatted={renderFormattedMessage} />
                    </p>
                    <div className="flex items-center justify-end gap-1 pt-0.5">
                      <span className={cn("text-[9px] font-thin opacity-50", isMe ? "text-white" : "text-gray-400")}>
                        {formatTime(m.data_registrada)}
                      </span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#4fc3f7]" />}
                    </div>
                  </div>

                  {/* Reactions */}
                  {Object.keys(reactions).length > 0 && (
                    <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex gap-1`}>
                      {Object.entries(reactions).map(([emoji, users]: [string, any]) => (
                        <div key={emoji} className="bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
                          <span className="text-[10px]">{emoji}</span>
                          <span className="text-[9px] font-bold text-gray-500">{users.length}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </main>

      {/* Floating Scroll Down */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 w-10 h-10 bg-[#1A237E] text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-90 transition-transform"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-50 p-4 pt-2">
        <AnimatePresence>
          {replyTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 border-l-4 border-[#1A237E] rounded-xl p-3 mb-2 flex justify-between items-center"
            >
              <div className="truncate">
                <p className="text-[11px] font-bold text-[#1A237E]">{t('chat.replying_to')} {maskPhone(replyTo.perfis_mcpn?.telefone || "Utilizador")}</p>
                <p className="text-[12px] text-gray-500 truncate italic">
                  <TranslatedMessage text={replyTo.mensagem} language={language} renderFormatted={(t: string) => t || 'Imagem'} />
                </p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-gray-400 p-1"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
          <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-[#1A237E] transition-colors shrink-0">
            <Plus className="w-6 h-6" />
          </button>

          <div className="flex-1 bg-gray-50 rounded-[25px] flex flex-col border border-transparent focus-within:border-gray-100 transition-all overflow-hidden">
            {imagePreview && (
              <div className="p-3 pb-0 relative">
                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                <button onClick={() => setImagePreview(null)} className="absolute top-2 left-12 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={publicInput}
              onChange={(e) => {
                setPublicInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t('chat.input_placeholder')}
              className="w-full px-5 py-3 text-[15px] bg-transparent resize-none outline-none max-h-[120px]"
              rows={1}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={isSending || (!publicInput.trim() && !imagePreview)}
            className="w-11 h-11 bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 disabled:opacity-30 transition-all shrink-0"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </footer>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative" 
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowInfo(false)} className="absolute top-6 right-6 text-gray-400"><X className="w-6 h-6" /></button>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-[24px] bg-gray-50 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-[#1A237E]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('chat.title')}</h2>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  {t('chat.info_desc')}
                </p>
                <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-3 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('common.status')}</span>
                    <span className="font-bold text-[#C62828]">{t('chat.status_active') || 'Ativo'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('chat.security')}</span>
                    <span className="font-bold text-[#1A237E]">{t('chat.encrypted')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Zoom */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black flex items-center justify-center" 
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} className="max-w-full max-h-full object-contain" alt="Zoom" />
            <button className="absolute top-10 right-6 text-white"><X className="w-8 h-8" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
