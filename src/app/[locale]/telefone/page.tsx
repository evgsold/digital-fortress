'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Phone, ArrowLeft, Battery, Wifi, Signal, CheckCircle, XCircle, ShieldAlert, User, Search, AlertCircle, Menu, Monitor, Smartphone, Minus, Square, X, Clock } from 'lucide-react';

// Типы для приложений
type AppType = 'home' | 'email' | 'sms' | 'phone';
type GameState = 'idle' | 'incoming' | 'reading' | 'won' | 'lost' | 'won_warning';
type DeviceType = 'mobile' | 'desktop';

interface Scenario {
  id: string;
  title: string;
  description: string;
  type: AppType;
  notification: {
    title: string;
    body: string;
  };
  content: {
    sender: string;
    subject?: string;
    text: string;
    time: string;
    isScam: boolean;
  };
  correctAction: 'block' | 'ignore' | 'delete';
  verificationRequired?: boolean;
  verificationContactId?: string;
  clue?: string;
}

const CONTACTS = [
  { id: 'son', name: 'Сын', number: '+7 (900) 555-35-35', avatar: 'bg-blue-400' },
  { id: 'mom', name: 'Мама', number: '+7 (900) 111-22-33', avatar: 'bg-pink-400' },
  { id: 'boss', name: 'Босс', number: '+7 (900) 999-88-77', avatar: 'bg-gray-700' },
  { id: 'bank', name: 'Банк Поддержка', number: '900', avatar: 'bg-green-600' },
  { id: 'friend', name: 'Лучший друг', number: '+7 (900) 777-11-22', avatar: 'bg-purple-400' },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'sms-son-money',
    title: 'Сын просит денег',
    description: 'Сообщение с незнакомого номера от "сына".',
    type: 'sms',
    notification: {
      title: 'Неизвестный номер',
      body: 'Мам, это я, телефон сломался...'
    },
    content: {
      sender: '+7 (999) 123-45-67',
      text: 'Мам, привет! Мой телефон сломался, пишу с номера друга. Срочно скинь 5000р на карту 4276..., очень надо, потом все объясню!',
      time: 'Сейчас',
      isScam: true
    },
    correctAction: 'block',
    verificationRequired: true,
    verificationContactId: 'son',
    clue: 'Привет, мам! Что? Какой телефон? Я дома, с моим телефоном все в порядке. Никаких денег я не просил. Это развод!'
  },
  {
    id: 'sms-bank',
    title: 'Блокировка карты',
    description: 'Классический SMS-фишинг от имени банка.',
    type: 'sms',
    notification: {
      title: 'Bank-Security',
      body: 'ВАЖНО: Ваша карта заблокирована...'
    },
    content: {
      sender: 'Bank-Security',
      text: 'ВАЖНО: Ваша карта заблокирована из-за подозрительной активности. Для разблокировки перейдите по ссылке: http://secure-bank-fix.com/verify',
      time: 'Сейчас',
      isScam: true
    },
    correctAction: 'block',
    verificationRequired: true,
    verificationContactId: 'bank',
    clue: 'Здравствуйте. Это служба безопасности банка. Мы не рассылаем такие сообщения. Ваша карта работает нормально. Не переходите по ссылкам!'
  },
  {
    id: 'email-ceo',
    title: 'Срочно от директора',
    description: 'Поддельное письмо от начальника.',
    type: 'email',
    notification: {
      title: 'Ivan Ivanov (CEO)',
      body: 'Срочный перевод'
    },
    content: {
      sender: 'Ivan Ivanov (CEO) <ceo.office.mail@gmail.com>',
      subject: 'Срочный банковский перевод',
      text: 'Привет. Я сейчас на встрече, не могу говорить по телефону. Срочно оплати этот счет поставщику, это очень важно для закрытия квартала. Реквизиты во вложении. Сделай это немедленно, я проверю вечером.',
      time: '11:15',
      isScam: true
    },
    correctAction: 'block',
    verificationRequired: true,
    verificationContactId: 'boss',
    clue: 'Алло? Я на встрече, но никаких счетов я тебе не отправлял. Посмотри внимательно на адрес отправителя, это не моя почта.'
  },
  {
    id: 'email-lottery',
    title: 'Выигрыш в лотерею',
    description: 'Письмо о неожиданном выигрыше.',
    type: 'email',
    notification: {
      title: 'Lottery Winner',
      body: 'Поздравляем! Вы выиграли...'
    },
    content: {
      sender: 'Lottery Winner',
      subject: 'Поздравляем! Вы выиграли 1 000 000 рублей!',
      text: 'Уважаемый пользователь! Ваш email был выбран случайным образом. Чтобы получить выигрыш, оплатите комиссию за перевод по ссылке...',
      time: '10:45',
      isScam: true
    },
    correctAction: 'block',
    verificationRequired: false
  }
];

interface GameProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onAction: (action: 'link' | 'block' | 'reply' | 'ignore') => void;
  currentScenario: Scenario | null;
  isVerified: boolean;
  setIsVerified: (v: boolean) => void;
  setCallFeedback: (s: string | null) => void;
}

// --- МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ ---

const EmailApp = ({ onBack, gameState, onAction, currentScenario }: { onBack: () => void } & GameProps) => {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const emails = [
    { id: 1, sender: "Security Team", subject: "Ваш аккаунт в опасности!", time: "10:30", preview: "Мы заметили подозрительную активность...", text: "Мы заметили подозрительную активность. Пожалуйста, смените пароль.", isScam: false },
    { id: 2, sender: "Boss", subject: "Срочно: отчет", time: "09:15", preview: "Мне нужен этот отчет на столе к обеду.", text: "Жду отчет до 13:00.", isScam: false },
  ];

  const displayEmails = (gameState === 'incoming' || gameState === 'reading') && currentScenario?.type === 'email'
    ? [{ id: 999, sender: currentScenario.content.sender, subject: currentScenario.content.subject || '', time: currentScenario.content.time, preview: currentScenario.content.text.substring(0, 30) + '...', text: currentScenario.content.text, isScam: true }, ...emails]
    : emails;

  return (
    <div className="flex flex-col h-full bg-white text-black">
      <div className="bg-blue-600 p-4 text-white flex items-center gap-3 shadow-md z-10">
        <button onClick={selectedEmail ? () => setSelectedEmail(null) : onBack} className="hover:bg-blue-700 p-2 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-xl">Почта</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!selectedEmail ? (
          displayEmails.map((email) => (
            <div key={email.id} onClick={() => setSelectedEmail(email.id)} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${email.isScam ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-900 truncate w-3/4 text-base">{email.sender}</span>
                <span className="text-xs text-gray-500">{email.time}</span>
              </div>
              <div className="font-medium text-base text-gray-800 mb-1">{email.subject}</div>
              <div className="text-sm text-gray-500 truncate">{email.preview}</div>
              {email.isScam && <div className="mt-1 text-xs text-blue-500 font-medium">Новое сообщение</div>}
            </div>
          ))
        ) : (
          (() => {
            const email = displayEmails.find(e => e.id === selectedEmail);
            if (!email) return null;
            return (
              <div className="flex flex-col h-full p-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 leading-tight">{email.subject}</h3>
                  <div className="flex flex-col text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-base truncate mr-2">От: {email.sender}</span>
                      <span className="whitespace-nowrap">{email.time}</span>
                    </div>
                  </div>
                  <div className="h-px bg-gray-200 mb-4"></div>
                  <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">{email.text}</p>
                </div>
                {email.isScam && (
                  <div className="mt-auto space-y-3 pb-4">
                    <button onClick={() => onAction('link')} className="w-full p-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors text-base shadow-sm">Выполнить требование</button>
                    <button onClick={() => onAction('block')} className="w-full p-4 bg-red-500 text-bl rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-base shadow-sm"><ShieldAlert size={20} />В спам и удалить</button>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const SMSApp = ({ onBack, gameState, onAction, currentScenario }: { onBack: () => void } & GameProps) => {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  const messages = [
    { id: 1, sender: "+7 (900) 123-45-67", text: "Мам, скинь денег на карту, потом объясню", time: "11:20", isScam: false },
    { id: 2, sender: "Bank", text: "Код подтверждения: 4829. Никому не сообщайте.", time: "10:05", isScam: false },
  ];

  const displayMessages = (gameState === 'incoming' || gameState === 'reading') && currentScenario?.type === 'sms'
    ? [{ id: 999, sender: currentScenario.content.sender, text: currentScenario.content.text, time: currentScenario.content.time, isScam: true }, ...messages]
    : messages;

  return (
    <div className="flex flex-col h-full bg-gray-50 text-black">
      <div className="bg-green-600 p-4 text-white flex items-center gap-3 shadow-md z-10">
        <button onClick={selectedMessage ? () => setSelectedMessage(null) : onBack} className="hover:bg-green-700 p-2 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-xl">Сообщения</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedMessage ? (
          displayMessages.map((msg) => (
            <div key={msg.id} onClick={() => setSelectedMessage(msg.id)} className={`mb-4 bg-white p-4 rounded-2xl shadow-sm border cursor-pointer hover:bg-gray-50 transition-colors ${msg.isScam ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-base text-gray-900">{msg.sender}</span>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
              <p className="text-base text-gray-700 truncate">{msg.text}</p>
              {msg.isScam && <div className="mt-1 text-xs text-red-500 font-medium">Новое сообщение</div>}
            </div>
          ))
        ) : (
          (() => {
            const msg = displayMessages.find(m => m.id === selectedMessage);
            if (!msg) return null;
            return (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-4 mx-2 mt-2">
                    <div className="font-bold text-lg mb-1">{msg.sender}</div>
                    <div className="text-xs text-gray-400 mb-4">{msg.time}</div>
                    <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.isScam && (
                    <div className="space-y-3 mt-8 px-4 pb-4">
                      <button onClick={() => onAction('link')} className="w-full p-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-base shadow-sm">Перейти по ссылке / Перевести</button>
                      <button onClick={() => onAction('block')} className="w-full p-4 bg-red-500 text-black rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"><ShieldAlert size={20} />Заблокировать</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const PhoneApp = ({ onBack, gameState, currentScenario, setIsVerified, setCallFeedback }: { onBack: () => void } & GameProps) => {
  const [callingContact, setCallingContact] = useState<typeof CONTACTS[0] | null>(null);

  const handleCall = (contact: typeof CONTACTS[0]) => {
    setCallingContact(contact);
    setTimeout(() => {
      setCallingContact(null);
      if (gameState === 'reading' && currentScenario?.verificationContactId === contact.id) {
        setIsVerified(true);
        setCallFeedback(currentScenario.clue || "Абонент подтвердил, что это не он.");
      } else {
        setCallFeedback("Абонент ответил, но ничего подозрительного не сообщил.");
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white text-black relative">
      <AnimatePresence>
        {callingContact && (
          <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} className="absolute inset-0 z-50 bg-gray-900 text-white flex flex-col items-center pt-20">
            <div className={`w-32 h-32 rounded-full ${callingContact.avatar} flex items-center justify-center mb-6 text-5xl shadow-2xl`}>{callingContact.name[0]}</div>
            <h3 className="text-3xl font-bold mb-2">{callingContact.name}</h3>
            <p className="text-gray-400 text-lg mb-12">Звонок...</p>
            <div className="mt-auto mb-20 flex gap-12">
               <button className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"><Phone size={40} className="rotate-[135deg]" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-800 p-4 flex items-center gap-3 shadow-md z-10">
        <button onClick={onBack} className="hover:bg-gray-700 p-2 rounded-full"><ArrowLeft size={24} /></button>
        <h2 className="font-bold text-xl">Контакты</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {CONTACTS.map((contact) => (
          <div key={contact.id} onClick={() => handleCall(contact)} className="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className={`w-12 h-12 rounded-full ${contact.avatar} flex items-center justify-center mr-4 text-white font-bold text-lg`}>{contact.name[0]}</div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-base">{contact.name}</div>
              <div className="text-sm text-gray-500">{contact.number}</div>
            </div>
            <button className="p-2 bg-green-100 rounded-full text-green-600"><Phone size={20} className="fill-current" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ДЕСКТОПНЫЕ ПРИЛОЖЕНИЯ ---

const DesktopWindow = ({ title, icon: Icon, onClose, children }: { title: string, icon: any, onClose: () => void, children: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="absolute inset-4 md:inset-10 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300 z-20"
  >
    {/* Titlebar */}
    <div className="h-10 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-2 text-gray-700">
        <Icon size={16} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-3 text-gray-500">
        <Minus size={16} className="cursor-pointer hover:text-black" />
        <Square size={14} className="cursor-pointer hover:text-black" />
        <X size={18} className="cursor-pointer hover:text-red-500" onClick={onClose} />
      </div>
    </div>
    {/* Content */}
    <div className="flex-1 overflow-hidden relative bg-white text-black">
      {children}
    </div>
  </motion.div>
);

const DesktopEmailApp = ({ onBack, gameState, onAction, currentScenario }: { onBack: () => void } & GameProps) => {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const emails = [
    { id: 1, sender: "Security Team", subject: "Ваш аккаунт в опасности!", time: "10:30", preview: "Мы заметили подозрительную активность...", text: "Мы заметили подозрительную активность. Пожалуйста, смените пароль.", isScam: false },
    { id: 2, sender: "Boss", subject: "Срочно: отчет", time: "09:15", preview: "Мне нужен этот отчет на столе к обеду.", text: "Жду отчет до 13:00.", isScam: false },
  ];

  const displayEmails = (gameState === 'incoming' || gameState === 'reading') && currentScenario?.type === 'email'
    ? [{ id: 999, sender: currentScenario.content.sender, subject: currentScenario.content.subject || '', time: currentScenario.content.time, preview: currentScenario.content.text.substring(0, 30) + '...', text: currentScenario.content.text, isScam: true }, ...emails]
    : emails;

  const activeEmail = displayEmails.find(e => e.id === selectedEmail);

  return (
    <DesktopWindow title="Mail Client Pro" icon={Mail} onClose={onBack}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-3 font-bold text-gray-700 border-b border-gray-200">Входящие</div>
          {displayEmails.map((email) => (
            <div key={email.id} onClick={() => setSelectedEmail(email.id)} className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${selectedEmail === email.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'} ${email.isScam && selectedEmail !== email.id ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm truncate">{email.sender}</span>
                <span className="text-xs text-gray-500">{email.time}</span>
              </div>
              <div className="text-sm font-medium truncate">{email.subject}</div>
              <div className="text-xs text-gray-500 truncate">{email.preview}</div>
            </div>
          ))}
        </div>
        {/* Reading Pane */}
        <div className="w-2/3 flex flex-col bg-white">
          {activeEmail ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold mb-4">{activeEmail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">{activeEmail.sender[0]}</div>
                  <div>
                    <div className="font-semibold text-sm">{activeEmail.sender}</div>
                    <div className="text-xs text-gray-500">Кому: мне • {activeEmail.time}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto text-gray-800 whitespace-pre-wrap">
                {activeEmail.text}
              </div>
              {activeEmail.isScam && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                  <button onClick={() => onAction('link')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">Перейти по ссылке</button>
                  <button onClick={() => onAction('block')} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"><ShieldAlert size={16} /> В спам</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Выберите письмо для чтения
            </div>
          )}
        </div>
      </div>
    </DesktopWindow>
  );
};

const DesktopChatApp = ({ onBack, gameState, onAction, currentScenario }: { onBack: () => void } & GameProps) => {
  const messages = [
    { id: 1, sender: "+7 (900) 123-45-67", text: "Мам, скинь денег на карту, потом объясню", time: "11:20", isScam: false },
  ];

  const displayMessages = (gameState === 'incoming' || gameState === 'reading') && currentScenario?.type === 'sms'
    ? [{ id: 999, sender: currentScenario.content.sender, text: currentScenario.content.text, time: currentScenario.content.time, isScam: true }, ...messages]
    : messages;

  const activeMsg = displayMessages[0]; // В десктопе сразу показываем первый чат

  return (
    <DesktopWindow title="Web Messenger" icon={MessageSquare} onClose={onBack}>
      <div className="flex h-full">
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
            <Search size={16} className="text-gray-500" />
            <input type="text" placeholder="Поиск..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          {displayMessages.map((msg) => (
            <div key={msg.id} className={`p-3 border-b border-gray-200 cursor-pointer ${msg.id === activeMsg?.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm truncate">{msg.sender}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <div className="text-xs text-gray-600 truncate">{msg.text}</div>
            </div>
          ))}
        </div>
        <div className="w-2/3 flex flex-col bg-[#E5DDD5]">
          {activeMsg ? (
            <>
              <div className="h-14 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">{activeMsg.sender[0]}</div>
                <div className="font-semibold text-sm">{activeMsg.sender}</div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                <div className="bg-white p-3 rounded-lg rounded-tl-none max-w-[80%] self-start shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{activeMsg.text}</p>
                  <div className="text-[10px] text-gray-400 text-right mt-1">{activeMsg.time}</div>
                </div>
              </div>
              {activeMsg.isScam && (
                <div className="p-4 bg-gray-100 flex gap-3 justify-center border-t border-gray-200">
                  <button onClick={() => onAction('link')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">Перейти / Перевести</button>
                  <button onClick={() => onAction('block')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"><ShieldAlert size={16} /> Заблокировать</button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </DesktopWindow>
  );
};

const DesktopVoipApp = ({ onBack, gameState, currentScenario, setIsVerified, setCallFeedback }: { onBack: () => void } & GameProps) => {
  const [callingContact, setCallingContact] = useState<typeof CONTACTS[0] | null>(null);

  const handleCall = (contact: typeof CONTACTS[0]) => {
    setCallingContact(contact);
    setTimeout(() => {
      setCallingContact(null);
      if (gameState === 'reading' && currentScenario?.verificationContactId === contact.id) {
        setIsVerified(true);
        setCallFeedback(currentScenario.clue || "Абонент подтвердил, что это не он.");
      } else {
        setCallFeedback("Абонент ответил, но ничего подозрительного не сообщил.");
      }
    }, 2000);
  };

  return (
    <DesktopWindow title="Corporate VoIP" icon={Phone} onClose={onBack}>
      <div className="flex h-full relative">
        {/* Экран звонка поверх всего окна */}
        <AnimatePresence>
          {callingContact && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center">
              <div className={`w-24 h-24 rounded-full ${callingContact.avatar} flex items-center justify-center mb-4 text-4xl shadow-lg`}>{callingContact.name[0]}</div>
              <h3 className="text-2xl font-bold mb-2">{callingContact.name}</h3>
              <p className="text-gray-400 mb-8">Соединение...</p>
              <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"><Phone size={24} className="rotate-[135deg]" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-1/3 border-r border-gray-200 bg-gray-50 p-4">
          <h3 className="font-bold text-gray-700 mb-4">Контакты</h3>
          <div className="space-y-2">
            {CONTACTS.map((contact) => (
              <div key={contact.id} onClick={() => handleCall(contact)} className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors">
                <div className={`w-8 h-8 rounded-full ${contact.avatar} flex items-center justify-center mr-3 text-white font-bold text-xs`}>{contact.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{contact.name}</div>
                </div>
                <Phone size={14} className="text-green-600" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-2/3 bg-white flex flex-col items-center justify-center text-gray-400">
          <Phone size={48} className="mb-4 opacity-20" />
          <p>Выберите контакт для звонка</p>
        </div>
      </div>
    </DesktopWindow>
  );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ---

export default function AppSimulationPage() {
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [currentApp, setCurrentApp] = useState<AppType>('home');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [notification, setNotification] = useState<{title: string, body: string} | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [showScenarioList, setShowScenarioList] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [callFeedback, setCallFeedback] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 768);
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startGame = (scenario: Scenario) => {
    setCurrentScenario(scenario);
    setShowScenarioList(false);
    setShowMobileMenu(false);
    setGameState('incoming');
    setIsVerified(false);
    setCallFeedback(null);
    setCurrentApp('home');
    
    setTimeout(() => {
      setNotification({
        title: scenario.notification.title,
        body: scenario.notification.body
      });
    }, 1500);
  };

  const handleAction = (action: 'link' | 'block' | 'reply' | 'ignore') => {
    if (action === 'block') {
      if (currentScenario?.verificationRequired && !isVerified) {
        setGameState('won_warning');
      } else {
        setGameState('won');
      }
    } else {
      setGameState('lost');
    }
  };

  const openApp = (app: AppType) => {
    setCurrentApp(app);
    if (gameState === 'incoming' && currentScenario?.type === app) {
      setGameState('reading');
      setNotification(null);
    }
  };

  const goHome = () => setCurrentApp('home');

  const resetGame = () => {
    setGameState('idle');
    setCurrentApp('home');
    setNotification(null);
    setShowScenarioList(true);
    setCurrentScenario(null);
    setIsVerified(false);
    setCallFeedback(null);
    setShowMobileMenu(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col md:flex-row items-center justify-center p-4 gap-8">
      
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-lg text-[#2D3748] border border-[#E2E8F0]"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(showMobileMenu || isWideScreen) && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`fixed inset-0 z-40 bg-[#F7FAFC]/95 backdrop-blur-xl p-6 md:p-0 md:bg-transparent md:backdrop-blur-none md:static md:max-w-sm w-full flex flex-col ${!showMobileMenu && 'hidden md:flex'}`}
          >
            <div className="md:bg-white md:backdrop-blur-md md:p-6 md:rounded-xl md:border md:border-[#E2E8F0] text-[#2D3748] h-full md:h-auto overflow-y-auto">
              <div className="flex justify-between items-center mb-6 md:mb-4">
                <h1 className="text-3xl md:text-2xl font-bold text-[#2D3748] font-mono">Симулятор фишинга</h1>
                <button className="md:hidden p-2" onClick={() => setShowMobileMenu(false)}><XCircle size={24} /></button>
              </div>

              {/* Device Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button 
                  onClick={() => setDeviceType('mobile')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${deviceType === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Smartphone size={16} /> Телефон
                </button>
                <button 
                  onClick={() => setDeviceType('desktop')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${deviceType === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Monitor size={16} /> Компьютер
                </button>
              </div>
              
              {gameState === 'idle' && showScenarioList && (
                <>
                  <p className="text-[#718096] mb-4 text-lg md:text-base font-mono">Выберите сценарий для тренировки:</p>
                  <div className="space-y-3">
                    {SCENARIOS.map((scenario) => (
                      <button key={scenario.id} onClick={() => startGame(scenario)} className="w-full p-4 bg-[#F7FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-xl text-left transition-colors group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#2D3748] text-lg md:text-base font-mono">{scenario.title}</span>
                          {scenario.verificationRequired && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-300 font-mono">Сложный</span>}
                        </div>
                        <p className="text-sm md:text-xs text-[#718096] font-mono">{scenario.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {gameState !== 'idle' && (
                <div className="text-base md:text-sm text-[#718096] mb-4 space-y-4 md:space-y-2 font-mono">
                  {gameState === 'incoming' && <p className="animate-pulse text-[#4299E1] font-bold">🔔 Вам пришло уведомление! Проверьте устройство.</p>}
                  {gameState === 'reading' && (
                    <>
                      <p>Изучите сообщение.</p>
                      {currentScenario?.verificationRequired && !isVerified && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <p className="text-yellow-700 text-sm flex items-start gap-2 font-mono">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>Подсказка: Не спешите. Может стоит проверить информацию? Попробуйте позвонить кому-нибудь.</span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {gameState === 'won' && <p className="text-green-600 font-bold text-lg">Отлично! Вы распознали фишинг и приняли верное решение.</p>}
                  {gameState === 'won_warning' && <p className="text-yellow-600">Вы заблокировали мошенника, это верно. Но в реальной жизни лучше сначала позвонить близкому человеку по старому номеру, чтобы убедиться, что с ним все в порядке.</p>}
                  {gameState === 'lost' && <p className="text-red-500 font-bold text-lg">О нет! Вы попались на уловку мошенников.</p>}
                </div>
              )}
              
              {(gameState === 'won' || gameState === 'lost' || gameState === 'won_warning') && (
                <button onClick={resetGame} className="w-full py-3 md:py-2 bg-[#4299E1] text-white font-bold rounded-xl hover:bg-[#3182CE] transition-colors mt-4 font-mono">
                  Выбрать другой сценарий
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Simulator Area */}
      <div className="flex-1 flex items-center justify-center w-full max-w-5xl">
        
        {/* --- MOBILE FRAME --- */}
        {deviceType === 'mobile' && (
          <div className="relative w-full max-w-[360px] h-[85vh] max-h-[750px] bg-gray-900 rounded-[2.5rem] border-[6px] md:border-8 border-gray-800 shadow-2xl overflow-hidden ring-4 ring-gray-900/50 shrink-0">
            <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 z-50 flex items-center justify-between px-6 text-white text-xs font-medium backdrop-blur-sm">
              <span>9:41</span>
              <div className="flex items-center gap-1.5"><Signal size={12} /><Wifi size={12} /><Battery size={12} /></div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-xl z-50"></div>

            <AnimatePresence>
              {notification && (
                <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} onClick={() => openApp(currentScenario?.type || 'sms')} className="absolute top-10 left-3 right-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl z-40 cursor-pointer flex items-start gap-3 border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${currentScenario?.type === 'email' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {currentScenario?.type === 'email' ? <Mail size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-bold text-sm text-gray-900">{notification.title}</h4>
                      <span className="text-[10px] text-gray-500">Сейчас</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{notification.body}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {callFeedback && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-6 right-6 -translate-y-1/2 bg-black/85 backdrop-blur-xl p-6 rounded-2xl z-50 text-white text-center shadow-2xl border border-white/10">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-base font-medium leading-relaxed">{callFeedback}</p>
                  <button onClick={() => setCallFeedback(null)} className="mt-6 px-6 py-2 bg-white/20 rounded-full text-sm font-bold hover:bg-white/30 transition-colors">Понятно</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full h-full bg-gray-100 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {currentApp === 'home' ? (
                  <motion.div key="home" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full h-full pt-12 px-4 pb-20 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="grid grid-cols-4 gap-4 mt-auto h-full content-end pb-8">
                      <button onClick={() => openApp('email')} className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform relative">
                          <Mail size={32} />
                          {gameState === 'incoming' && currentScenario?.type === 'email' && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white font-bold">1</span>}
                        </div>
                        <span className="text-white text-xs font-medium drop-shadow-md">Почта</span>
                      </button>
                      <button onClick={() => openApp('sms')} className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform relative">
                          <MessageSquare size={32} />
                          {gameState === 'incoming' && currentScenario?.type === 'sms' && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white font-bold">1</span>}
                        </div>
                        <span className="text-white text-xs font-medium drop-shadow-md">SMS</span>
                      </button>
                      <button onClick={() => openApp('phone')} className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 bg-green-400 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform relative">
                          <Phone size={32} />
                          {currentScenario?.verificationRequired && !isVerified && gameState === 'reading' && <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white animate-pulse font-bold">?</span>}
                        </div>
                        <span className="text-white text-xs font-medium drop-shadow-md">Телефон</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="app" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="w-full h-full pt-8 bg-white">
                    {currentApp === 'email' && <EmailApp onBack={goHome} gameState={gameState} setGameState={setGameState} onAction={handleAction} currentScenario={currentScenario} isVerified={isVerified} setIsVerified={setIsVerified} setCallFeedback={setCallFeedback} />}
                    {currentApp === 'sms' && <SMSApp onBack={goHome} gameState={gameState} setGameState={setGameState} onAction={handleAction} currentScenario={currentScenario} isVerified={isVerified} setIsVerified={setIsVerified} setCallFeedback={setCallFeedback} />}
                    {currentApp === 'phone' && <PhoneApp onBack={goHome} gameState={gameState} setGameState={setGameState} onAction={handleAction} currentScenario={currentScenario} isVerified={isVerified} setIsVerified={setIsVerified} setCallFeedback={setCallFeedback} />}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(gameState === 'won' || gameState === 'won_warning') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-sm">
                        <CheckCircle size={60} className="mb-4 mx-auto text-green-500" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">{gameState === 'won' ? 'Идеально!' : 'Хорошо, но...'}</h2>
                        <p className="mb-6 text-gray-600">{gameState === 'won' ? 'Вы правильно проверили информацию и заблокировали мошенника.' : 'Вы заблокировали мошенника, но в следующий раз лучше сначала позвонить и проверить.'}</p>
                        <button onClick={resetGame} className="bg-white text-green-600 px-8 py-3 rounded-full font-bold shadow-xl text-lg hover:scale-105 transition-transform">Играть снова</button>
                    </motion.div>
                  </motion.div>
                )}
                {gameState === 'lost' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-sm">
                        <XCircle size={60} className="mb-4 mx-auto text-red-500" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Вы проиграли</h2>
                        <p className="mb-6 text-gray-600">Вы поверили мошенникам. Всегда проверяйте информацию перед тем, как переводить деньги или переходить по ссылкам.</p>
                        <button onClick={resetGame} className="bg-white text-red-600 px-8 py-3 rounded-full font-bold shadow-xl text-lg hover:scale-105 transition-transform">Попробовать снова</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/20 rounded-full z-50 cursor-pointer hover:bg-black/40 transition-colors" onClick={goHome}></div>
            </div>
          </div>
        )}

        {/* --- DESKTOP FRAME --- */}
        {deviceType === 'desktop' && (
          <div className="relative w-full max-w-4xl h-[70vh] min-h-[500px] bg-gray-900 rounded-xl border-[12px] border-gray-800 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Desktop Wallpaper Area */}
            <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1506744626753-eba7bcce7b72?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
              
              {/* Desktop Icons */}
              <div className="p-4 flex flex-col gap-6 items-start">
                <button onDoubleClick={() => openApp('email')} onClick={() => openApp('email')} className="flex flex-col items-center gap-1 group w-20">
                  <div className="w-12 h-12 bg-blue-500/80 backdrop-blur rounded-lg flex items-center justify-center text-white shadow-lg border border-white/20 group-hover:bg-blue-500 transition-colors relative">
                    <Mail size={24} />
                    {gameState === 'incoming' && currentScenario?.type === 'email' && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow">1</span>}
                  </div>
                  <span className="text-white text-xs font-medium drop-shadow-md text-center">Почта</span>
                </button>
                <button onDoubleClick={() => openApp('sms')} onClick={() => openApp('sms')} className="flex flex-col items-center gap-1 group w-20">
                  <div className="w-12 h-12 bg-green-500/80 backdrop-blur rounded-lg flex items-center justify-center text-white shadow-lg border border-white/20 group-hover:bg-green-500 transition-colors relative">
                    <MessageSquare size={24} />
                    {gameState === 'incoming' && currentScenario?.type === 'sms' && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow">1</span>}
                  </div>
                  <span className="text-white text-xs font-medium drop-shadow-md text-center">Мессенджер</span>
                </button>
                <button onDoubleClick={() => openApp('phone')} onClick={() => openApp('phone')} className="flex flex-col items-center gap-1 group w-20">
                  <div className="w-12 h-12 bg-purple-500/80 backdrop-blur rounded-lg flex items-center justify-center text-white shadow-lg border border-white/20 group-hover:bg-purple-500 transition-colors relative">
                    <Phone size={24} />
                    {currentScenario?.verificationRequired && !isVerified && gameState === 'reading' && <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow animate-pulse">?</span>}
                  </div>
                  <span className="text-white text-xs font-medium drop-shadow-md text-center">VoIP Звонки</span>
                </button>
              </div>

              {/* Desktop Windows */}
              <AnimatePresence>
                {currentApp === 'email' && <DesktopEmailApp onBack={goHome} gameState={gameState} setGameState={setGameState} onAction={handleAction} currentScenario={currentScenario} isVerified={isVerified} setIsVerified={setIsVerified} setCallFeedback={setCallFeedback} />}
                {currentApp === 'sms' && <DesktopChatApp onBack={goHome} gameState={gameState} setGameState={setGameState} onAction={handleAction} currentScenario={currentScenario} isVerified={isVerified} setIsVerified={setIsVerified} setCallFeedback={setCallFeedback} />}
                {currentApp === 'phone' && <DesktopVoipApp onBack={goHome} gameState={gameState} setGameState={setGameState} onAction={handleAction} currentScenario={currentScenario} isVerified={isVerified} setIsVerified={setIsVerified} setCallFeedback={setCallFeedback} />}
              </AnimatePresence>

              {/* Desktop Notifications (Bottom Right) */}
              <AnimatePresence>
                {notification && (
                  <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} onClick={() => openApp(currentScenario?.type || 'sms')} className="absolute bottom-4 right-4 w-80 bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-2xl z-40 cursor-pointer flex items-start gap-3 border border-gray-200">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white shrink-0 ${currentScenario?.type === 'email' ? 'bg-blue-500' : 'bg-green-500'}`}>
                      {currentScenario?.type === 'email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900">{notification.title}</h4>
                      <p className="text-xs text-gray-600 truncate mt-1">{notification.body}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop Call Feedback */}
              <AnimatePresence>
                {callFeedback && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-xl p-6 rounded-xl z-50 text-white text-center shadow-2xl border border-white/10 max-w-sm">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-base font-medium leading-relaxed">{callFeedback}</p>
                    <button onClick={() => setCallFeedback(null)} className="mt-6 px-6 py-2 bg-white/20 rounded text-sm font-bold hover:bg-white/30 transition-colors">Закрыть</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop Success/Fail Overlays */}
              <AnimatePresence>
                {(gameState === 'won' || gameState === 'won_warning') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="bg-white rounded-xl shadow-2xl p-10 max-w-lg">
                        <CheckCircle size={70} className="mb-5 mx-auto text-green-500" />
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">{gameState === 'won' ? 'Идеально!' : 'Хорошо, но...'}</h2>
                        <p className="mb-8 text-lg text-gray-600 leading-relaxed">{gameState === 'won' ? 'Вы правильно проверили информацию и заблокировали мошенника.' : 'Вы заблокировали мошенника, но в следующий раз лучше сначала позвонить и проверить.'}</p>
                        <button onClick={resetGame} className="bg-white text-green-600 px-8 py-3 rounded font-bold shadow-xl text-lg hover:bg-gray-100 transition-colors">Играть снова</button>
                    </motion.div>
                  </motion.div>
                )}
                {gameState === 'lost' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="bg-white rounded-xl shadow-2xl p-10 max-w-lg">
                        <XCircle size={70} className="mb-5 mx-auto text-red-500" />
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">Вы проиграли</h2>
                        <p className="mb-8 text-lg text-gray-600 leading-relaxed">Вы поверили мошенникам. Всегда проверяйте информацию перед тем, как переводить деньги или переходить по ссылкам.</p>
                        <button onClick={resetGame} className="bg-white text-red-600 px-8 py-3 rounded font-bold shadow-xl text-lg hover:bg-gray-100 transition-colors">Попробовать снова</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Taskbar */}
            <div className="h-12 bg-white/90 backdrop-blur-md border-t border-gray-300 flex items-center justify-between px-2 z-50">
              <div className="flex items-center gap-2">
                <button onClick={goHome} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded transition-colors">
                  <Monitor size={20} className="text-blue-600" />
                </button>
                {/* Open App Indicators in Taskbar */}
                {currentApp !== 'home' && (
                  <div className="flex items-center gap-2 ml-2 border-l border-gray-300 pl-2">
                    <div className="px-3 py-1.5 bg-gray-200 rounded text-sm font-medium flex items-center gap-2 text-gray-700 border-b-2 border-blue-500">
                      {currentApp === 'email' && <><Mail size={14}/> Mail Client</>}
                      {currentApp === 'sms' && <><MessageSquare size={14}/> Messenger</>}
                      {currentApp === 'phone' && <><Phone size={14}/> VoIP</>}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 px-2 text-gray-600 text-xs font-medium">
                <div className="flex items-center gap-2"><Wifi size={14} /><Battery size={14} /></div>
                <div className="flex flex-col items-end">
                  <span>14:30</span>
                  <span>24.05.2026</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}