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
  // --- МОШЕННИЧЕСТВО (10 сценариев) ---

  // 1. Фишинг
  {
      category: 'phishing',
      description: 'Вам пришло письмо от "Службы безопасности банка": "Ваш счет заблокирован. Перейдите по ссылке, чтобы подтвердить личность". Ссылка ведет на сайт `secure-bank-login.com`.',
      isScam: true,
      explanationForScam: 'Правильно! Банки никогда не просят переходить по ссылкам для разблокировки счета. Адрес сайта подозрительный и не принадлежит официальному банку.',
      explanationForNotScam: 'Ошибка! Это классический фишинг. Ссылка ведет на поддельный сайт, созданный для кражи ваших логина и пароля.',
  },
  // 2. Фишинг
  {
      category: 'phishing',
      description: 'Вы получили SMS: "Вам начислена компенсация 15 000 руб. Получить: gosuslugi-vyplaty.ru".',
      isScam: true,
      explanationForScam: 'Верно. Официальные уведомления от Госуслуг приходят только в личном кабинете, а домен сайта поддельный.',
      explanationForNotScam: 'Это мошенничество. Ссылка ведет на фишинговый сайт, имитирующий Госуслуги, чтобы украсть ваши данные или деньги под предлогом "комиссии".',
  },
  // 3. Фишинг
  {
      category: 'phishing',
      description: 'Коллега прислал в Telegram файл "Зарплатная_ведомость_2024.exe" с подписью "Посмотри, тут ошибка в расчетах".',
      isScam: true,
      explanationForScam: 'Верно! Документы не могут иметь расширение .exe. Это исполняемый файл, который, скорее всего, установит вирус на ваш компьютер.',
      explanationForNotScam: 'Опасно! Расширение .exe указывает на программу, а не документ. Запуск такого файла может заразить ваше устройство вредоносным ПО.',
  },
  // 4. Социальная инженерия
  {
      category: 'social_engineering',
      description: 'Вам звонят из "полиции" и сообщают, что с вашего счета пытаются украсть деньги. Чтобы их спасти, нужно перевести средства на "безопасный счет".',
      isScam: true,
      explanationForScam: 'Абсолютно верно! "Безопасных счетов" не существует. Сотрудники полиции и ЦБ никогда не просят переводить деньги.',
      explanationForNotScam: 'Это обман. Мошенники используют страх и авторитет госструктур, чтобы заставить вас добровольно отдать им средства.',
  },
  // 5. Социальная инженерия
  {
      category: 'social_engineering',
      description: 'На улице к вам подходит человек, показывает дорогой телефон и говорит, что нашел его. Предлагает купить его у вас за полцены.',
      isScam: true,
      explanationForScam: 'Верно. Скорее всего, телефон украден или это качественная подделка. Покупка таких вещей может привести к проблемам с законом.',
      explanationForNotScam: 'Это развод. Вы рискуете купить краденую вещь или дешевую реплику по завышенной цене.',
  },
  // 6. Поддельные сайты
  {
      category: 'fake_websites',
      description: 'Вы заходите на сайт интернет-магазина. Дизайн выглядит обычно, но в адресной строке написано `wildberrries.ru` (с тремя "r").',
      isScam: true,
      explanationForScam: 'Правильно! Это тайпсквоттинг — регистрация доменов с опечатками. Невнимательный пользователь не заметит подмены и введет свои данные.',
      explanationForNotScam: 'Ошибка. Всегда проверяйте адресную строку. Лишняя буква в названии говорит о том, что это фишинговый сайт-клон.',
  },
  // 7. Телефонное мошенничество
  {
      category: 'phone_scams',
      description: 'Звонок с незнакомого номера. Робот говорит: "Ваша карта заблокирована. Нажмите 1 для соединения с оператором".',
      isScam: true,
      explanationForScam: 'Правильно. Банки не используют автоинформаторы для сообщения о блокировках. Это способ отсеять недоверчивых и соединить с мошенником.',
      explanationForNotScam: 'Это мошенничество. Если вы нажмете 1, вас начнут обрабатывать по скрипту. Лучше повесить трубку и перезвонить в банк.',
  },
  // 8. Инвестиционное мошенничество
  {
      category: 'investment_fraud',
      description: 'В Telegram-канале известный блогер предлагает "раскрутку счета": вы переводите 1000 рублей, а через 3 часа получаете 20 000 рублей.',
      isScam: true,
      explanationForScam: 'Правильно! "Раскрутка счета" — это всегда мошенничество. Никто не будет просто так раздавать деньги. Вы потеряете свой депозит.',
      explanationForNotScam: 'Это обман. Мошенники могут даже прислать поддельные скриншоты выплат, но в итоге вы останетесь без денег.',
  },
  // 9. Кража личности
  {
      category: 'identity_theft',
      description: 'Вы нашли флешку на парковке возле офиса. На ней написано "Зарплата руководства". Вы решаете вставить ее в рабочий компьютер.',
      isScam: true,
      explanationForScam: 'Верно! Это целевая атака. На флешке может быть вирус-шпион, который украдет корпоративные данные или зашифрует файлы.',
      explanationForNotScam: 'Очень опасно! Никогда не подключайте найденные носители к своим устройствам. Это классический способ проникновения в защищенные сети.',
  },
  // 10. Другое
  {
      category: 'other',
      description: 'Вы продаете товар на Авито. Покупатель пишет в WhatsApp и предлагает оформить "Авито Доставку", присылая свою ссылку для получения денег.',
      isScam: true,
      explanationForScam: 'Правильно. Все сделки должны проходить внутри чата платформы. Ссылки в мессенджерах ведут на фишинговые сайты для кражи данных карты.',
      explanationForNotScam: 'Это мошенничество. Настоящая доставка оформляется на сайте. Если вас уводят в сторонний мессенджер — это попытка обмана.',
  },

  // --- НЕ МОШЕННИЧЕСТВО (10 сценариев) ---

  // 11. Фишинг (легитимный)
  {
      category: 'phishing',
      description: 'Вы переходите на сайт своего банка, вводите логин и пароль. Браузер показывает зеленый замочек и адрес `online.sberbank.ru`.',
      isScam: false,
      explanationForScam: 'Это настоящий сайт. Адрес верный, соединение защищено (HTTPS). Внимательность важна, но в данном случае угрозы нет.',
      explanationForNotScam: 'Правильно. Вы проверили адрес и наличие шифрования. Это безопасный вход в интернет-банк.',
  },
  // 12. Фишинг (легитимный)
  {
      category: 'phishing',
      description: 'На почту пришло уведомление от Netflix: "Оплата не прошла. Обновите платежные данные". Письмо отправлено с официального адреса `support@netflix.com`.',
      isScam: false,
      explanationForScam: 'Ошибка. Хотя нужно быть осторожным с такими письмами, в данном случае адрес отправителя (`@netflix.com`) официальный. Это может быть реальная проблема с оплатой.',
      explanationForNotScam: 'Правильно. Вы обратили внимание на официальный домен отправителя. Это легитимное письмо. Лучше всего не переходить по ссылке, а зайти на сайт Netflix вручную и проверить статус платежа.',
  },
  // 13. Социальная инженерия (легитимная)
  {
      category: 'social_engineering',
      description: 'Вам пишет старый друг: "Привет! Можешь одолжить 5000 до завтра?". Вы звоните ему по телефону, и он подтверждает свою просьбу, объясняя ситуацию.',
      isScam: false,
      explanationForScam: 'Неверно. Хотя первоначальное сообщение было подозрительным, вы предприняли правильный шаг — позвонили и лично убедились. После проверки это уже не мошенничество.',
      explanationForNotScam: 'Верно. Вы не стали слепо переводить деньги, а проверили информацию, позвонив другу. Это самый надежный способ убедиться, что вас не обманывают.',
  },
  // 14. Социальная инженерия (легитимная)
  {
      category: 'social_engineering',
      description: 'Вам звонит оператор сотовой связи с официального номера и предлагает перейти на новый, более выгодный тариф, не запрашивая никаких кодов или паролей.',
      isScam: false,
      explanationForScam: 'Ошибка. Операторы действительно обзванивают клиентов. Ключевые признаки безопасности: звонок с официального номера и отсутствие запросов на конфиденциальные данные.',
      explanationForNotScam: 'Правильно. Пока вас не просят сообщать коды из SMS или пароли, это, скорее всего, легитимное маркетинговое предложение. Вы всегда можете перезвонить оператору сами для проверки.',
  },
  // 15. Поддельные сайты (легитимный)
  {
      category: 'fake_websites',
      description: 'Вы ищете билеты на поезд и заходите на известный сайт-агрегатор (например, tutu.ru). Цены совпадают с официальными, сайт имеет защищенное HTTPS-соединение.',
      isScam: false,
      explanationForScam: 'Ошибка. Крупные и известные сайты-агрегаторы являются надежными посредниками. Они работают официально и предоставляют реальные билеты.',
      explanationForNotScam: 'Правильно. Вы выбрали проверенный сервис для покупки билетов. Наличие HTTPS и хорошая репутация сайта говорят о его надежности.',
  },
  // 16. Телефонное мошенничество (легитимное)
  {
      category: 'phone_scams',
      description: 'Вам приходит SMS от службы доставки: "Курьер не смог до вас дозвониться. Пожалуйста, перезвоните по номеру +7-XXX-XXX-XX-XX". Номер выглядит как обычный мобильный.',
      isScam: false,
      explanationForScam: 'В данном случае это, скорее всего, не мошенничество. Курьерские службы часто используют мобильные номера. Если вы действительно ждете посылку, перезвонить безопасно.',
      explanationForNotScam: 'Правильно. Если вы ожидаете доставку, такой звонок является нормальной практикой. Мошеннические схемы обычно используют короткие или международные номера.',
  },
  // 17. Инвестиционное мошенничество (легитимное)
  {
      category: 'investment_fraud',
      description: 'Вы скачиваете официальное приложение брокера (например, "Тинькофф Инвестиции") из App Store / Google Play и пополняете счет для покупки акций.',
      isScam: false,
      explanationForScam: 'Это стандартная и безопасная процедура. Использование официальных приложений от крупных брокеров, скачанных из официальных магазинов, является легитимным способом инвестирования.',
      explanationForNotScam: 'Верно. Вы используете проверенные инструменты для инвестиций. Ключевые моменты безопасности — официальное приложение и загрузка из надежного источника.',
  },
  // 18. Кража личности (легитимная)
  {
      category: 'identity_theft',
      description: 'Вы оформляете кредитную карту через официальное приложение вашего банка. Приложение просит вас сфотографировать паспорт для подтверждения личности.',
      isScam: false,
      explanationForScam: 'Это безопасная процедура. Внутри официального банковского приложения передача данных защищена. Банки обязаны идентифицировать клиентов, и это стандартный способ.',
      explanationForNotScam: 'Верно. Ключевой фактор — все происходит внутри официального приложения банка, а не в переписке с незнакомцем. Это легитимное требование.',
  },
  // 19. Другое (легитимное)
  {
      category: 'other',
      description: 'Вы совершаете покупку в крупном сетевом магазине. На кассе вам предлагают оформить карту лояльности, назвав свой номер телефона для получения скидки.',
      isScam: false,
      explanationForScam: 'Это стандартная маркетинговая практика. Предоставление номера телефона для карты лояльности в известном магазине безопасно и не несет рисков.',
      explanationForNotScam: 'Правильно. Это обычная программа лояльности. Мошенничество здесь отсутствует, так как вас не просят сообщать конфиденциальную информацию или переводить деньги.',
  },
  // 20. Другое (легитимное)
  {
      category: 'other',
      description: 'Вам приходит push-уведомление из приложения банка: "Подтвердите операцию входа в личный кабинет с нового устройства". Вы действительно заходите с нового компьютера.',
      isScam: false,
      explanationForScam: 'Это стандартная мера безопасности. Если вы действительно совершаете это действие, то подтверждение входа через push-уведомление является нормальной практикой.',
      explanationForNotScam: 'Верно. Это легитимная функция безопасности вашего банка. Опасно было бы, если бы вы не пытались войти, а уведомление пришло.',
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