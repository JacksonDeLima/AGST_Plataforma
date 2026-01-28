import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon, Globe } from 'lucide-react';
import './Configuracoes.css';

const Configuracoes = () => {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const languages = [
        { code: 'pt', name: 'Português', flag: '🇧🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];

    return (
        <div className="configuracoes-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('settings.title')}</h1>
                    <p className="page-subtitle">{t('settings.subtitle')}</p>
                </div>
            </header>

            <div className="settings-grid">
                {/* Seção de Idioma */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="settings-card-title">{t('settings.language.title')}</h3>
                            <p className="settings-card-description">{t('settings.language.description')}</p>
                        </div>
                    </div>

                    <div className="language-options">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                className={`language-btn ${language === lang.code ? 'active' : ''}`}
                                onClick={() => setLanguage(lang.code)}
                            >
                                <span className="language-flag">{lang.flag}</span>
                                <span className="language-name">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seção de Tema */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon">
                            {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                        </div>
                        <div>
                            <h3 className="settings-card-title">{t('settings.theme.title')}</h3>
                            <p className="settings-card-description">{t('settings.theme.description')}</p>
                        </div>
                    </div>

                    <div className="theme-options">
                        <button
                            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <Sun size={20} />
                            <span>{t('settings.theme.light')}</span>
                        </button>
                        <button
                            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <Moon size={20} />
                            <span>{t('settings.theme.dark')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;
