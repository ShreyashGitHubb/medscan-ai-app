import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from '../constants/translations';

const LANGUAGE_KEY = 'medscan_language_v1';
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (storedLang && TRANSLATIONS[storedLang]) {
                setLanguage(storedLang);
            }
        } catch (error) {
            console.error('Failed to load language:', error);
        }
    };

    const changeLanguage = async (lang) => {
        if (TRANSLATIONS[lang]) {
            setLanguage(lang);
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);
        }
    };

    const t = (key) => {
        return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
