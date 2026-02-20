import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error("ОШИБКА: Переменные окружения не загружены! Проверьте наличие файла .env.local");
  }
// Описывает один игровой сценарий или ситуацию
export interface GameScenario {
    id: string;
    // Текст ситуации, который показывается игроку
    description: string;
    // Правильный ответ: true, если это мошенничество, false - если нет
    isScam: boolean;
    // Объяснение, которое показывается, если пользователь ответил "Да, это мошенники"
    explanationForScam: string;
    // Объяснение, которое показывается, если пользователь ответил "Нет, это не мошенники"
    explanationForNotScam: string;
    // Категория сценария
    category: string;
  }
  
  // Описывает игровую сессию конкретного пользователя
  export interface GameSession {
    id: string;
    userId: string;
    // Массив ID сценариев, которые будут в этой игре
    scenarioIds: string[];
    // Индекс текущего вопроса в массиве scenarioIds
    currentScenarioIndex: number;
    // Количество правильных ответов
    score: number;
    // Статус игры: 'in-progress' (в процессе) или 'completed' (завершена)
    status: 'in-progress' | 'completed';
    createdAt: string;
    updatedAt: string;
  }
  
  // Ответ пользователя на конкретный сценарий в рамках сессии
  export interface UserAnswer {
    id: string;
    sessionId: string;
    scenarioId: string;
    userId: string;
    // Ответ пользователя (true - считает, что это мошенничество)
    userGuess: boolean;
    // Был ли ответ правильным
    isCorrect: boolean;
    answeredAt: string;
  }
  export const gameScenarioSchema = z.object({
    // Описание ситуации, которое видит пользователь
    description: z.string().min(10, "Описание должно содержать не менее 10 символов"),
    
    // Является ли ситуация мошенничеством
    isScam: z.boolean(),
    
    // Объяснение, если пользователь выбрал "Да, это мошенники"
    explanationForScam: z.string().min(10, "Объяснение должно содержать не менее 10 символов"),
    
    // Объяснение, если пользователь выбрал "Нет, это не мошенники"
    explanationForNotScam: z.string().min(10, "Объяснение должно содержать не менее 10 символов"),

    // Категория сценария
    category: z.string().min(3, "Категория должна быть указана"),
  });
  
  // Схема для игровой сессии
  export const gameSessionSchema = z.object({
    // ID пользователя, который играет
    userId: z.string(),
    
    // Массив ID сценариев для этой сессии
    scenarioIds: z.array(z.string()).nonempty("В сессии должен быть хотя бы один сценарий"),
    
    // Индекс текущего сценария в массиве
    currentScenarioIndex: z.number().int().nonnegative().default(0),
    
    // Текущий счет игрока
    score: z.number().int().nonnegative().default(0),
    
    // Статус сессии
    status: z.enum(['in-progress', 'completed']).default('in-progress'),
    
    // Дата создания
    createdAt: z.string(),
    
    // Дата последнего обновления
    updatedAt: z.string(),
  });
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    addDoc,
    writeBatch, // Важно для транзакционных удалений
    arrayUnion, // Для добавления элементов в массив
    arrayRemove
  } from 'firebase/firestore';

const createOperation = async <T>(
    collectionName: string,
    docId: string,
    data: Omit<T, 'id'>,
    schema: any
  ) => {
    const validatedData = schema.parse(data);
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, validatedData);
    return validatedData;
  };
  
  const readOperation = async <T>(collectionName: string, docId: string): Promise<T | null> => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  };
  
  const updateOperation = async <T>(collectionName: string, docId: string, data: Partial<T>, schema: any) => {
    const existingData = await readOperation<T>(collectionName, docId);
    const validatedData = schema.parse({ ...existingData, ...data });
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, validatedData);
    return validatedData;
  };
  
  const deleteOperation = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  };

export const gameSessionOperations = {
    // Создание новой игровой сессии для пользователя
    create: async (data: Omit<GameSession, 'id'>): Promise<GameSession> => {
      const sessionsCollection = collection(db, 'gameSessions');
      // const validatedData = gameSessionSchema.parse(data);
      const docRef = await addDoc(sessionsCollection, data);
      return { id: docRef.id, ...data };
    },
  
    // Получение данных сессии по ID
    read: (sessionId: string): Promise<GameSession | null> => {
      return readOperation<GameSession>('gameSessions', sessionId);
    },
  
    // Обновление сессии (например, переход к следующему вопросу, изменение счета)
    update: (sessionId: string, data: Partial<GameSession>) => {
      // Добавляем/обновляем дату последнего изменения
      const updateData = { ...data, updatedAt: new Date().toISOString() };
      return updateOperation('gameSessions', sessionId, updateData, gameSessionSchema);
    },
  
    // Получение последней активной сессии пользователя
    getActiveSession: async (userId: string): Promise<GameSession | null> => {
      const sessionsCollection = collection(db, 'gameSessions');
      const q = query(
        sessionsCollection,
        where('userId', '==', userId),
        where('status', '==', 'in-progress'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { ...doc.data() as Omit<GameSession, 'id'>, id: doc.id };
    }
  };
  
  
  
// Массив с данными игровых сценариев
const gameScenariosData: Omit<GameScenario, 'id'>[] = [
    // --- Phishing ---
    {
        category: 'phishing',
        description: 'Вам пришло письмо от "Службы безопасности банка": "Ваш счет заблокирован из-за подозрительной активности. Перейдите по ссылке, чтобы подтвердить личность". Ссылка ведет на сайт `secure-bank-login.com`.',
        isScam: true,
        explanationForScam: 'Правильно! Банки никогда не просят переходить по ссылкам для разблокировки счета. Адрес сайта подозрительный и не принадлежит официальному банку.',
        explanationForNotScam: 'Ошибка! Это классический фишинг. Ссылка ведет на поддельный сайт, созданный для кражи ваших логина и пароля.',
    },
    {
        category: 'phishing',
        description: 'Вы получили SMS: "Вам начислена компенсация 15 000 руб. Получить: gosuslugi-vyplaty.ru".',
        isScam: true,
        explanationForScam: 'Верно. Официальные уведомления от Госуслуг приходят только в личном кабинете или с официальных номеров, а домен сайта поддельный.',
        explanationForNotScam: 'Это мошенничество. Ссылка ведет на фишинговый сайт, имитирующий Госуслуги, чтобы украсть ваши данные или деньги под предлогом "комиссии".',
    },
    {
        category: 'phishing',
        description: 'На почту пришло уведомление от Netflix: "Оплата не прошла. Обновите платежные данные". Письмо отправлено с адреса `support@netflix-billing-update.com`.',
        isScam: true,
        explanationForScam: 'Правильно! Крупные компании отправляют письма только со своих официальных доменов (например, @netflix.com). Адрес отправителя выдает мошенников.',
        explanationForNotScam: 'Неверно. Мошенники часто маскируются под известные сервисы. Всегда проверяйте адрес отправителя перед тем, как кликать по ссылкам.',
    },
    {
        category: 'phishing',
        description: 'Коллега прислал в Telegram файл "Зарплатная_ведомость_2024.exe" с подписью "Посмотри, тут ошибка в расчетах".',
        isScam: true,
        explanationForScam: 'Верно! Документы не могут иметь расширение .exe. Это исполняемый файл, который, скорее всего, установит вирус на ваш компьютер.',
        explanationForNotScam: 'Опасно! Расширение .exe указывает на программу, а не документ. Запуск такого файла может заразить ваше устройство вредоносным ПО.',
    },
    {
        category: 'phishing',
        description: 'Вы переходите на сайт своего банка, вводите логин и пароль. Браузер показывает зеленый замочек и адрес `online.sberbank.ru`.',
        isScam: false,
        explanationForScam: 'Это настоящий сайт. Адрес верный, соединение защищено (HTTPS). Внимательность важна, но в данном случае угрозы нет.',
        explanationForNotScam: 'Правильно. Вы проверили адрес и наличие шифрования. Это безопасный вход в интернет-банк.',
    },

    // --- Social Engineering ---
    {
        category: 'social_engineering',
        description: 'Вам звонят из "полиции" и сообщают, что с вашего счета пытаются украсть деньги. Чтобы их спасти, нужно перевести средства на "безопасный счет" Центробанка.',
        isScam: true,
        explanationForScam: 'Абсолютно верно! "Безопасных счетов" не существует. Сотрудники полиции и ЦБ никогда не просят переводить деньги.',
        explanationForNotScam: 'Это обман. Мошенники используют страх потери денег и авторитет госструктур, чтобы заставить вас добровольно отдать им средства.',
    },
    {
        category: 'social_engineering',
        description: 'В соцсети пишет старый друг: "Привет! Срочно нужны деньги до завтра, карту заблокировали. Переведи 5000 на этот номер, завтра верну 6000".',
        isScam: true,
        explanationForScam: 'Правильно. Аккаунт друга, скорее всего, взломан. Мошенники часто просят деньги в долг от имени знакомых.',
        explanationForNotScam: 'Ошибка. Прежде чем переводить деньги, позвоните другу по телефону и убедитесь, что это действительно он пишет.',
    },
    {
        category: 'social_engineering',
        description: 'На улице к вам подходит человек, показывает дорогой телефон и говорит, что нашел его, но он заблокирован. Предлагает купить его у вас за полцены.',
        isScam: true,
        explanationForScam: 'Верно. Скорее всего, телефон украден или это качественная подделка. Покупка таких вещей может привести к проблемам с законом.',
        explanationForNotScam: 'Это развод. Вы рискуете купить краденую вещь или дешевую реплику по завышенной цене.',
    },
    {
        category: 'social_engineering',
        description: 'Вам звонит "оператор сотовой связи" и говорит, что договор на ваш номер заканчивается. Чтобы продлить его, нужно продиктовать код из SMS.',
        isScam: true,
        explanationForScam: 'Правильно! Договоры на сим-карты бессрочные. Код из SMS нужен мошенникам для входа в ваш личный кабинет или на Госуслуги.',
        explanationForNotScam: 'Неверно. Никому не сообщайте коды из SMS. Мошенники используют этот предлог, чтобы украсть ваш цифровой профиль.',
    },

    // --- Fake Websites ---
    {
        category: 'fake_websites',
        description: 'Вы ищете билеты на поезд и находите сайт `rzd-ticket-booking.org`, где билеты стоят на 30% дешевле, чем на официальном сайте.',
        isScam: true,
        explanationForScam: 'Верно. Мошенники создают клоны популярных сервисов с заниженными ценами. Билеты вы не получите, а данные карты украдут.',
        explanationForNotScam: 'Это ловушка. Слишком низкая цена — главный признак поддельного сайта. Покупайте билеты только на официальных ресурсах.',
    },
    {
        category: 'fake_websites',
        description: 'Вы заходите на сайт интернет-магазина. Дизайн выглядит обычно, но в адресной строке написано `wildberrries.ru` (с тремя "r").',
        isScam: true,
        explanationForScam: 'Правильно! Это тайпсквоттинг — регистрация доменов с опечатками. Невнимательный пользователь не заметит подмены и введет свои данные.',
        explanationForNotScam: 'Ошибка. Всегда проверяйте адресную строку. Лишняя буква в названии говорит о том, что это фишинговый сайт-клон.',
    },
    {
        category: 'fake_websites',
        description: 'Вы хотите скачать популярную программу. В поиске первая ссылка ведет на сайт с кучей кнопок "Скачать" и рекламой, а адрес сайта — набор букв.',
        isScam: true,
        explanationForScam: 'Верно. Официальные сайты программ обычно выглядят аккуратно и имеют понятный домен. Такие "помойки" часто распространяют вирусы.',
        explanationForNotScam: 'Опасно. Скачивание ПО с непроверенных ресурсов — верный способ заразить компьютер трояном или майнером.',
    },

    // --- Phone Scams ---
    {
        category: 'phone_scams',
        description: 'Звонок с незнакомого номера. Робот говорит: "Ваша карта заблокирована. Нажмите 1 для соединения с оператором".',
        isScam: true,
        explanationForScam: 'Правильно. Банки не используют автоинформаторы для сообщения о блокировках таким образом. Это способ отсеять недоверчивых и соединить с мошенником.',
        explanationForNotScam: 'Это мошенничество. Если вы нажмете 1, вас начнут обрабатывать по скрипту социальной инженерии. Лучше повесить трубку и перезвонить в банк.',
    },
    {
        category: 'phone_scams',
        description: 'Вам звонят и сбрасывают. Вы перезваниваете, и со счета списывается крупная сумма за звонок на платный номер.',
        isScam: true,
        explanationForScam: 'Верно. Это схема "One Ring Scam". Мошенники рассчитывают на ваше любопытство. Никогда не перезванивайте на незнакомые номера.',
        explanationForNotScam: 'Ошибка. Перезванивая на неизвестные номера, вы рискуете попасть на платную линию или нарваться на мошенников.',
    },

    // --- Investment Fraud ---
    {
        category: 'investment_fraud',
        description: 'В Telegram-канале известный блогер предлагает "раскрутку счета": вы переводите 1000 рублей, а через 3 часа получаете 20 000 рублей.',
        isScam: true,
        explanationForScam: 'Правильно! "Раскрутка счета" — это всегда мошенничество. Никто не будет просто так раздавать деньги. Вы потеряете свой депозит.',
        explanationForNotScam: 'Это обман. Мошенники могут даже прислать поддельные скриншоты выплат, но в итоге вы останетесь без денег.',
    },
    {
        category: 'investment_fraud',
        description: 'Вам предлагают инвестировать в акции Газпрома через специальное приложение "Газпром Инвестиции 2.0", которого нет в официальных сторах.',
        isScam: true,
        explanationForScam: 'Верно. Мошенники часто используют бренды крупных компаний. Скачивать финансовые приложения можно только из официальных источников.',
        explanationForNotScam: 'Опасно. Установка приложений из непроверенных источников может дать мошенникам полный доступ к вашему телефону и банковским приложениям.',
    },

    // --- Identity Theft ---
    {
        category: 'identity_theft',
        description: 'Вам предлагают оформить кредит с плохой кредитной историей, но просят прислать фото паспорта и СНИЛС "для проверки".',
        isScam: true,
        explanationForScam: 'Правильно. Отправляя фото документов незнакомцам, вы рискуете, что на ваше имя оформят микрозаймы или зарегистрируют фирмы-однодневки.',
        explanationForNotScam: 'Ошибка. Ваши паспортные данные — это ключ к вашей цифровой личности. Никогда не отправляйте их через мессенджеры сомнительным лицам.',
    },
    {
        category: 'identity_theft',
        description: 'Вы нашли флешку на парковке возле офиса. На ней написано "Зарплата руководства". Вы решаете вставить ее в рабочий компьютер.',
        isScam: true,
        explanationForScam: 'Верно! Это целевая атака. На флешке может быть вирус-шпион, который украдет корпоративные данные или зашифрует файлы.',
        explanationForNotScam: 'Очень опасно! Никогда не подключайте найденные носители к своим устройствам. Это классический способ проникновения в защищенные сети.',
    },

    // --- Other ---
    {
        category: 'other',
        description: 'Вы продаете товар на Авито. Покупатель пишет в WhatsApp и предлагает оформить "Авито Доставку", присылая свою ссылку для получения денег.',
        isScam: true,
        explanationForScam: 'Правильно. Все сделки должны проходить внутри чата платформы. Ссылки в мессенджерах ведут на фишинговые сайты для кражи данных карты.',
        explanationForNotScam: 'Это мошенничество. Настоящая доставка оформляется автоматически на сайте. Если вас уводят в сторонний мессенджер — это попытка обмана.',
    },
    {
        category: 'other',
        description: 'В браузере всплывает окно: "Поздравляем! Вы 1000-й посетитель и выиграли iPhone. Оплатите только доставку 300 рублей".',
        isScam: true,
        explanationForScam: 'Верно. Бесплатный сыр только в мышеловке. Вы оплатите "доставку", но приз никогда не получите, а данные карты утекут.',
        explanationForNotScam: 'Ошибка. Подобные розыгрыши — это всегда лохотрон. Цель — выманить небольшую сумму и данные вашей карты.',
    }
];

// Функция для заполнения базы данных
const seedGameScenarios = async () => {
  console.log('Начинается заполнение сценариев...');
  try {
    for (const scenarioData of gameScenariosData) {
      const scenarioId = crypto.randomUUID();
      await createOperation('gameScenarios', scenarioId, { ...scenarioData, id: scenarioId }, gameScenarioSchema);
      console.log(`Сценарий "${scenarioData.description.substring(0, 30)}..." успешно добавлен.`);
    }
    console.log('Заполнение сценариев успешно завершено!');
  } catch (error) {
    console.error('Ошибка при заполнении сценариев:', error);
  }
};

// Вызов функции для запуска сидера
seedGameScenarios();