
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: t('languages.english'), nativeName: 'English' },
    { code: 'ar', name: t('languages.arabic'), nativeName: 'العربية' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Update document direction and language
    document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
    
    // Update body classes for RTL styling
    if (languageCode === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }

    // Store the preference
    localStorage.setItem('preferred-language', languageCode);
    localStorage.setItem('text-direction', languageCode === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 rtl:flex-row-reverse">
          <Languages className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border border-border shadow-lg min-w-[180px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`rtl:text-right ${i18n.language === language.code ? 'bg-accent/20 text-accent-foreground' : ''}`}
          >
            <div className="flex items-center justify-between w-full rtl:flex-row-reverse">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-sm text-muted-foreground rtl:mr-2 ltr:ml-2">({language.name})</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
