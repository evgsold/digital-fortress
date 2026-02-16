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
    {
        description: 'На экране вашего компьютера внезапно появляется окно: "Обнаружен опасный вирус! Ваш компьютер заблокирован. Срочно позвоните в службу поддержки по номеру +X(XXX)XXX-XX-XX".',
        isScam: true,
        explanationForScam: 'Правильно! Это тактика запугивания. Настоящие антивирусы не блокируют компьютер и не требуют звонить по телефону. Цель мошенников — получить удаленный доступ к вашему компьютеру.',
        explanationForNotScam: 'Неверно. Это классическая схема с фальшивой техподдержкой. Никогда не звоните по номерам из таких сообщений. Просто перезагрузите компьютер или закройте браузер через диспетчер задач.',
      },
      {
        description: 'Вам звонят из коммунальной службы и угрожают отключить электричество в течение часа за неуплату, если вы не погасите долг немедленно переводом на номер телефона.',
        isScam: true,
        explanationForScam: 'Верно. Коммунальные службы всегда присылают официальные квитанции и уведомления заранее. Требование срочной оплаты по телефону — это 100% мошенничество.',
        explanationForNotScam: 'Осторожно! Это обман, рассчитанный на панику. Настоящие компании не требуют оплату таким способом. Проверьте информацию в личном кабинете на официальном сайте или по официальному номеру телефона.',
      },
      {
        description: 'Вы получаете в мессенджере предложение о работе: "Обработка заказов, 2-3 часа в день, зарплата от 5000 рублей в день". Для начала нужно оплатить "страховой взнос" в размере 1000 рублей.',
        isScam: true,
        explanationForScam: 'Правильно. Легальные работодатели никогда не просят соискателей платить за трудоустройство. Любое требование денег до начала работы — это явный признак мошенничества.',
        explanationForNotScam: 'Это обман. Если работодатель требует от вас деньги под любым предлогом, это мошенническая схема. Вы просто потеряете свой "взнос", а "работу" так и не получите.',
      },
      {
        description: 'В соцсети вы видите рекламу "крипто-проекта", который гарантирует доходность 50% в месяц. На сайте нужно зарегистрироваться и перевести деньги на внутренний кошелек.',
        isScam: true,
        explanationForScam: 'Верно! Гарантированная сверхвысокая доходность — это главный признак финансовой пирамиды. Цифры на экране — просто рисунок, вывести деньги из такой системы невозможно.',
        explanationForNotScam: 'Это мошенничество. В реальных инвестициях всегда есть риск, и никто не может гарантировать такую прибыль. Это классическая пирамида, созданная для сбора денег с доверчивых пользователей.',
      },
      {
        description: 'Вы нажали "Забыли пароль" на сайте известного маркетплейса. Вам на почту пришло письмо с темой "Сброс вашего пароля" и ссылкой, которая ведет на официальный сайт для создания нового пароля.',
        isScam: false,
        explanationForScam: 'На самом деле, это стандартная и безопасная процедура. Так как вы сами инициировали сброс пароля, получение такого письма ожидаемо. Главное — убедиться, что домен в ссылке совпадает с адресом сайта.',
        explanationForNotScam: 'Правильно. Это легитимный процесс восстановления доступа к вашему аккаунту. Письмо пришло в ответ на ваши действия, и это является частью системы безопасности сервиса.',
      },
      {
        description: 'Вам приходит SMS от стоматологической клиники: "Напоминаем, вы записаны на прием завтра в 15:00. Пожалуйста, подтвердите визит, ответив ДА на это сообщение".',
        isScam: false,
        explanationForScam: 'Это стандартная практика. Клиники часто используют автоматические напоминания, чтобы снизить количество неявок. Сообщение не содержит ссылок и не просит денег, поэтому оно безопасно.',
        explanationForNotScam: 'Верно. Это обычное сервисное уведомление. Такие автоматизированные напоминания помогают как клиентам, так и компаниям. Никакой угрозы здесь нет.',
      },
      {
        description: 'Вам звонит плачущий "родственник", говорит, что попал в аварию. Затем трубку берет "полицейский", который предлагает "решить вопрос" за крупную сумму денег, которую нужно передать курьеру.',
        isScam: true,
        explanationForScam: 'Абсолютно верно. Это очень старая, но все еще эффективная схема эмоционального мошенничества. Главное правило — немедленно прервать разговор и самому перезвонить родственнику по его номеру телефона.',
        explanationForNotScam: 'Это жестокий обман! Мошенники — отличные психологи. Они создают панику и не дают времени подумать. Никогда не передавайте деньги незнакомцам, кем бы они ни представлялись.',
      },
      {
        description: 'При входе в свой аккаунт Google на новом устройстве вы получаете SMS с кодом подтверждения. В сообщении написано: "Ваш код подтверждения Google: G-123456. Никому его не сообщайте".',
        isScam: false,
        explanationForScam: 'Это как раз пример настоящей работы системы безопасности. Двухфакторная аутентификация защищает ваш аккаунт. Код приходит потому, что система зафиксировала легитимную попытку входа.',
        explanationForNotScam: 'Правильно. Это стандартная и очень важная мера безопасности (2FA). Она нужна, чтобы убедиться, что в аккаунт входите именно вы. Главное — никогда и никому не называть этот код.',
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