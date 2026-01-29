interface IconProps {
  className?: string;
  size?: number;
}

// Мишень - для тренировки
export function TargetIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// Документ с галочкой - для теста
export function TestIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Лупа - для поиска
export function SearchIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M15 15l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// График - для статистики
export function ChartIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="10" width="3" height="10" rx="1" fill="currentColor" />
      <rect x="11" y="6" width="3" height="14" rx="1" fill="currentColor" />
      <rect x="16" y="12" width="3" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}

// Силуэт - для пользователя
export function UserIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Соединение - для matching
export function MatchingIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="6" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Карточки - для flashcards
export function CardsIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 6V4a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Знак вопроса - для quiz
export function QuizIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9a3 3 0 115 2.83c0 1.17-2 1.17-2 2.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

// Клавиатура - для typing
export function KeyboardIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="10" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="14" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="7" y="13" width="8" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

// Книга - для слов
export function BookIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 4h6a2 2 0 012 2v14a1 1 0 01-1-1H4V4z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 4h-6a2 2 0 00-2 2v14a1 1 0 001-1h7V4z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Галочка - для правильных ответов
export function CheckIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Крестик - для неправильных ответов
export function CrossIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Молния - для combo
export function BoltIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Флаг - для сессий
export function FlagIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 22V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 4h12l-3 4 3 4H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Рука с приветствием
export function WaveIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 11V7a2 2 0 114 0v4M11 11V5a2 2 0 114 0v6M15 11V8a2 2 0 114 0v7a6 6 0 01-6 6h-2a6 6 0 01-6-6v-4a2 2 0 114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Кисточка/ручка - для режима написания
export function PenIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 2l7.586 7.586" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
