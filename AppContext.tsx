
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, Language, UserRole } from './types';

// Translations Dictionary
const translations: Record<Language, Record<string, string>> = {
  UZ: {
    nav_home: "Bosh sahifa", nav_orders: "Buyurtmalar", nav_products: "Mahsulotlar",
    nav_company: "Kompaniya", nav_logo: "Brend logotipi", nav_team: "Jamoa",
    logout: "Chiqish", welcome: "Xush kelibsiz", status_active: "Faol",
    status_inactive: "Nofaol", status_sold: "Sotildi", status_canceled: "Bekor qilindi",
    status_progress: "Jarayonda", status_all: "Barchasi", revenue: "Jami tushum",
    leaderboard: "Eng ko'p sotilganlar", refresh: "Yangilash", actions: "Amallar",
    save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish", add: "Qo'shish",
    edit: "Tahrirlash", username: "Foydalanuvchi nomi", password: "Maxfiy parol",
    login_btn: "Kirish", verify_code: "Tasdiqlash kodi", search: "Qidirish",
    phone: "Telefon", customer: "Mijoz", sum: "Summa", date: "Sana",
    error_loading: "Yuklashda xatolik", success_saved: "Muvaffaqiyatli saqlandi",
    delete_confirm: "Haqiqatan ham o'chirmoqchimisiz?", role_super: "Bosh admin",
    role_admin: "Admin", verify_title: "Kodni tasdiqlang", verify_desc: "Xavfsizlik kodi yuborildi",
    verify_pin: "Xavfsizlik PIN kodi", verify_btn: "Kirishni ochish"
  },
  RU: {
    nav_home: "Главная", nav_orders: "Заказы", nav_products: "Продукты",
    nav_company: "Компания", nav_logo: "Логотип бренда", nav_team: "Команда",
    logout: "Выйти", welcome: "Добро пожаловать", status_active: "Активен",
    status_inactive: "Неактивен", status_sold: "Продано", status_canceled: "Отменено",
    status_progress: "В процессе", status_all: "Все", revenue: "Общая выручка",
    leaderboard: "Топ продаж", refresh: "Обновить", actions: "Действия",
    save: "Сохранить", cancel: "Отмена", delete: "Удалить", add: "Добавить",
    edit: "Изменить", username: "Имя пользователя", password: "Пароль",
    login_btn: "Войти", verify_code: "Код подтверждения", search: "Поиск",
    phone: "Телефон", customer: "Клиент", sum: "Сумма", date: "Дата",
    error_loading: "Ошибка загрузки", success_saved: "Успешно сохранено",
    delete_confirm: "Вы уверены, что хотите удалить?", role_super: "Супер админ",
    role_admin: "Админ", verify_title: "Подтвердите код", verify_desc: "Код безопасности отправлен",
    verify_pin: "ПИН-код безопасности", verify_btn: "Открыть доступ"
  },
  EN: {
    nav_home: "Dashboard", nav_orders: "Orders", nav_products: "Products",
    nav_company: "Company", nav_logo: "Brand Logo", nav_team: "Team",
    logout: "Logout", welcome: "Welcome", status_active: "Active",
    status_inactive: "Inactive", status_sold: "Sold", status_canceled: "Canceled",
    status_progress: "In Progress", status_all: "All", revenue: "Total Revenue",
    leaderboard: "Leaderboard", refresh: "Refresh", actions: "Actions",
    save: "Save", cancel: "Cancel", delete: "Delete", add: "Add",
    edit: "Edit", username: "Username", password: "Password",
    login_btn: "Login", verify_code: "Verification Code", search: "Search",
    phone: "Phone", customer: "Customer", sum: "Amount", date: "Date",
    error_loading: "Error loading data", success_saved: "Successfully saved",
    delete_confirm: "Are you sure you want to delete?", role_super: "Super Admin",
    role_admin: "Admin", verify_title: "Verify Code", verify_desc: "Security code has been sent",
    verify_pin: "Security PIN Code", verify_btn: "Unlock Access"
  },
  TR: {
    nav_home: "Panel", nav_orders: "Siparişler", nav_products: "Ürünler",
    nav_company: "Şirket", nav_logo: "Marka Logosu", nav_team: "Ekip",
    logout: "Çıkış Yap", welcome: "Hoş geldiniz", status_active: "Aktif",
    status_inactive: "Pasif", status_sold: "Satıldı", status_canceled: "İptal edildi",
    status_progress: "Devam ediyor", status_all: "Tümü", revenue: "Toplam Gelir",
    leaderboard: "En Çok Satanlar", refresh: "Yenile", actions: "İşlemler",
    save: "Kaydet", cancel: "İptal", delete: "Sil", add: "Ekle",
    edit: "Düzenle", username: "Kullanıcı adı", password: "Şifre",
    login_btn: "Giriş", verify_code: "Doğrulama Kodu", search: "Ara",
    phone: "Telefon", customer: "Müşteri", sum: "Tutar", date: "Tarih",
    error_loading: "Veri yükleme hatası", success_saved: "Başarıyla kaydedildi",
    delete_confirm: "Silmek istediğinizden emin misiniz?", role_super: "Süper Yönetici",
    role_admin: "Yönetici", verify_title: "Kodu Doğrula", verify_desc: "Güvenlik kodu gönderildi",
    verify_pin: "Güvenlik PIN Kodu", verify_btn: "Erişimi Aç"
  }
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  auth: AuthState;
  setAuth: (newAuth: AuthState) => void;
  logout: () => void;
  notifications: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'UZ');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'light');
  const [auth, setAuthValue] = useState<AuthState>(() => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    role: localStorage.getItem('role') as any,
    username: localStorage.getItem('username')
  }));
  const [notifications, setNotifications] = useState<any[]>([]);

  const t = (key: string) => translations[language][key] || key;

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setAuth = (newAuth: AuthState) => {
    if (newAuth.accessToken) localStorage.setItem('accessToken', newAuth.accessToken);
    if (newAuth.refreshToken) localStorage.setItem('refreshToken', newAuth.refreshToken);
    if (newAuth.role) localStorage.setItem('role', newAuth.role);
    if (newAuth.username) localStorage.setItem('username', newAuth.username);
    setAuthValue(newAuth);
  };

  const logout = () => {
    localStorage.clear();
    setAuthValue({ accessToken: null, refreshToken: null, role: null, username: null });
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, t, theme, toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
      auth, setAuth, logout, notifications, showNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useLanguage = () => useContext(AppContext)!.language;
export const useSetLanguage = () => useContext(AppContext)!.setLanguage;
export const useT = () => useContext(AppContext)!.t;
export const useTheme = () => {
  const context = useContext(AppContext);
  return { theme: context!.theme, toggleTheme: context!.toggleTheme };
};
export const useAuth = () => {
  const context = useContext(AppContext);
  return { auth: context!.auth, setAuth: context!.setAuth, logout: context!.logout };
};
export const useNotification = () => {
  const context = useContext(AppContext);
  return { notifications: context!.notifications, showNotification: context!.showNotification };
};
