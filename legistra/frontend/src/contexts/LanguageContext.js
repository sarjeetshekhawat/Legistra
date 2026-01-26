import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation dictionary
const translations = {
  en: {
    // Navigation
    upload: 'Upload Documents',
    analysis: 'Analysis Results', 
    search: 'Search & Query',
    visualizations: 'Visualizations',
    settings: 'Settings',
    
    // Upload page
    uploadDocument: 'Upload Legal Document',
    uploadDescription: 'Upload your legal document for AI-powered analysis and clause extraction',
    documentUpload: 'Document Upload',
    supportedFormats: 'Supported formats: PDF, DOCX, TXT (Max 10MB)',
    clickToUpload: 'Click to upload or drag and drop',
    pdfDocxTxtFiles: 'PDF, DOCX, or TXT files',
    uploadingDocument: 'Uploading document...',
    uploadDocument: 'Upload Document',
    clear: 'Clear',
    
    // Analysis page
    analysisResults: 'Analysis Results',
    analysisDescription: 'AI-powered legal document analysis complete',
    selectDocument: 'Select Document',
    analyzeDocument: 'Analyze Document',
    analyzing: 'Analyzing...',
    documentSummary: 'Document Summary',
    identifiedClauses: 'Identified Clauses',
    riskAssessment: 'Risk Assessment',
    exportAnalysisReport: 'Export Analysis Report',
    
    // Settings page
    settings: 'Settings',
    settingsDescription: 'Manage your application preferences and configuration',
    generalSettings: 'General Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    desktopNotifications: 'Desktop Notifications',
    notificationsDescription: 'Receive alerts for completed analysis',
    analysisSettings: 'Analysis Settings',
    autoAnalysis: 'Auto Analysis',
    autoAnalysisDescription: 'Automatically analyze uploaded documents',
    defaultExportFormat: 'Default Export Format',
    emailAlerts: 'Email Alerts',
    emailAlertsDescription: 'Receive analysis results via email',
    accountSettings: 'Account Settings',
    emailAddress: 'Email Address',
    password: 'Password',
    apiKey: 'API Key',
    change: 'Change',
    update: 'Update',
    regenerate: 'Regenerate',
    saveSettings: 'Save Settings',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Authentication
    login: 'Sign In',
    loginDescription: 'Sign in to your account to access document analysis',
    register: 'Sign Up',
    registerDescription: 'Create a new account to get started',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    firstNamePlaceholder: 'Enter your first name',
    lastNamePlaceholder: 'Enter your last name',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signingIn: 'Signing in...',
    registering: 'Registering...',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    or: 'Or'
  },
  
  hi: {
    // Navigation
    upload: 'दस्तावेज़ अपलोड करें',
    analysis: 'विश्लेषण परिणाम',
    search: 'खोज और क्वेरी',
    visualizations: 'विज़ुअलाइज़ेशन',
    settings: 'सेटिंग्स',
    
    // Upload page
    uploadDocument: 'लीगल दस्तावेज़ अपलोड करें',
    uploadDescription: 'एआई-संचालित विश्लेषण और खंड निकालने के लिए अपना कानूनी दस्तावेज़ अपलोड करें',
    documentUpload: 'दस्तावेज़ अपलोड',
    supportedFormats: 'समर्थित प्रारूप: PDF, DOCX, TXT (अधिकतम 10MB)',
    clickToUpload: 'अपलोड करने के लिए क्लिक करें या खींचें',
    pdfDocxTxtFiles: 'PDF, DOCX, या TXT फ़ाइलें',
    uploadingDocument: 'दस्तावेज़ अपलोड हो रहा है...',
    uploadDocument: 'दस्तावेज़ अपलोड करें',
    clear: 'साफ करें',
    
    // Analysis page
    analysisResults: 'विश्लेषण परिणाम',
    analysisDescription: 'एआई-संचालित कानूनी दस्तावेज़ विश्लेषण पूर्ण',
    selectDocument: 'दस्तावेज़ चुनें',
    analyzeDocument: 'दस्तावेज़ का विश्लेषण करें',
    analyzing: 'विश्लेषण हो रहा है...',
    documentSummary: 'दस्तावेज़ सारांश',
    identifiedClauses: 'पहचाने गए खंड',
    riskAssessment: 'जोखिम मूल्यांकन',
    exportAnalysisReport: 'विश्लेषण रिपोर्ट निर्यात करें',
    
    // Settings page
    settings: 'सेटिंग्स',
    settingsDescription: 'अपने एप्लिकेशन प्राथमिकताओं और कॉन्फ़िगरेशन का प्रबंधन करें',
    generalSettings: 'सामान्य सेटिंग्स',
    theme: 'थीम',
    light: 'लाइट',
    dark: 'डार्क',
    language: 'भाषा',
    desktopNotifications: 'डेस्कटॉप सूचनाएं',
    notificationsDescription: 'पूर्ण विश्लेषण के लिए चेतावनी प्राप्त करें',
    analysisSettings: 'विश्लेषण सेटिंग्स',
    autoAnalysis: 'स्वचालित विश्लेषण',
    autoAnalysisDescription: 'अपलोड किए गए दस्तावेज़ों का स्वचालित रूप से विश्लेषण करें',
    defaultExportFormat: 'डिफ़ॉल्ट निर्यात प्रारूप',
    emailAlerts: 'ईमेल चेतावनी',
    emailAlertsDescription: 'विश्लेषण परिणाम ईमेल द्वारा प्राप्त करें',
    accountSettings: 'खाता सेटिंग्स',
    emailAddress: 'ईमेल पता',
    password: 'पासवर्ड',
    apiKey: 'API कुंजी',
    change: 'बदलें',
    update: 'अपडेट करें',
    regenerate: 'पुनः जेनरेट करें',
    saveSettings: 'सेटिंग्स सहेजें',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // Authentication
    login: 'साइन इन',
    loginDescription: 'दस्तावेज़ विश्लेषण तक पहुंचने के लिए अपने खाते में साइन इन करें',
    register: 'साइन अप',
    registerDescription: 'शुरू करने के लिए एक नया खाता बनाएं',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    confirmPasswordPlaceholder: 'पासवर्ड की पुष्टि करें',
    firstNamePlaceholder: 'अपना पहला नाम दर्ज करें',
    lastNamePlaceholder: 'अपना अंतिम नाम दर्ज करें',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    signingIn: 'साइन इन हो रहा है...',
    registering: 'रजिस्टर हो रहा है...',
    noAccount: 'खाता नहीं है?',
    haveAccount: 'पहले से खाता है?',
    or: 'या'
  },
  
  mr: {
    // Navigation
    upload: 'दस्तावेज अपलोड करा',
    analysis: 'विश्लेषण निकाल',
    search: 'शोध आणि क्वेरी',
    visualizations: 'व्हिज्युअलायझेशन',
    settings: 'सेटिंग्स',
    
    // Upload page
    uploadDocument: 'लीगल दस्तावेज अपलोड करा',
    uploadDescription: 'एआय-संचालित विश्लेषण आणि क्लॉज एक्सट्रॅक्शनसाठी आपले कायदेशी दस्तावेज अपलोड करा',
    documentUpload: 'दस्तावेज अपलोड',
    supportedFormats: 'समर्थित फॉरमॅट: PDF, DOCX, TXT (कमाल 10MB)',
    clickToUpload: 'अपलोड करण्यासाठी क्लिक करा किंवा ओढा',
    pdfDocxTxtFiles: 'PDF, DOCX, किंवा TXT फाइल्स',
    uploadingDocument: 'दस्तावेज अपलोड होत आहे...',
    uploadDocument: 'दस्तावेज अपलोड करा',
    clear: 'साफ करा',
    
    // Analysis page
    analysisResults: 'विश्लेषण निकाल',
    analysisDescription: 'एआय-संचालित कायदेशी दस्तावेज विश्लेषण पूर्ण',
    selectDocument: 'दस्तावेज निवडा',
    analyzeDocument: 'दस्तावेजाचे विश्लेषण करा',
    analyzing: 'विश्लेषण होत आहे...',
    documentSummary: 'दस्तावेज सारांश',
    identifiedClauses: 'ओळखलेले क्लॉज',
    riskAssessment: 'जोखम मूल्यांकन',
    exportAnalysisReport: 'विश्लेषण अहवाल निर्यात करा',
    
    // Settings page
    settings: 'सेटिंग्स',
    settingsDescription: 'आपले अप्लिकेशन प्राधानिकता आणि कॉन्फिगरेशन व्यवस्थापित करा',
    generalSettings: 'सामान्य सेटिंग्स',
    theme: 'थीम',
    light: 'लाइट',
    dark: 'डार्क',
    language: 'भाषा',
    desktopNotifications: 'डेस्कटॉप सूचना',
    notificationsDescription: 'पूर्ण विश्लेषणासाठी सूचना मिळवा',
    analysisSettings: 'विश्लेषण सेटिंग्स',
    autoAnalysis: 'स्वयंचालित विश्लेषण',
    autoAnalysisDescription: 'अपलोड केलेल्या दस्तावेजांचे स्वयंचालित विश्लेषण करा',
    defaultExportFormat: 'डीफॉल्ट एक्सपोर्ट फॉरमॅट',
    emailAlerts: 'ईमेल सूचना',
    emailAlertsDescription: 'विश्लेषण निकाल ईमेलद्वारे मिळवा',
    accountSettings: 'खाते सेटिंग्स',
    emailAddress: 'ईमेल पत्ता',
    password: 'पासवर्ड',
    apiKey: 'API की',
    change: 'बदला',
    update: 'अपडेट करा',
    regenerate: 'पुन्हा जनरेट करा',
    saveSettings: 'सेटिंग्स जतन करा',
    
    // Common
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यशस्वी',
    
    // Authentication
    login: 'साइन इन',
    loginDescription: 'दस्तावेज विश्लेषण तक पोहोचण्यासाठी आपल्या खाते मध्ये साइन इन करा',
    register: 'साइन अप',
    registerDescription: 'सुरु करण्यासाठी एक नवीन खाते तयार करा',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्डाची पुष्टी करा',
    firstName: 'पहिले नाव',
    lastName: 'आडनाव',
    emailPlaceholder: 'आपले ईमेल नमूद करा',
    passwordPlaceholder: 'आपले पासवर्ड नमूद करा',
    confirmPasswordPlaceholder: 'पासवर्डाची पुष्टी करा',
    firstNamePlaceholder: 'आपले पहिले नाव नमूद करा',
    lastNamePlaceholder: 'आपले आडनाव नमूद करा',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    signingIn: 'साइन इन होत आहे...',
    registering: 'रजिस्टर होत आहे...',
    noAccount: 'खाते नाही आहे?',
    haveAccount: 'आधीपासून खाते आहे?',
    or: 'किंवा'
  }
};

// Create context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('legistra_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLanguage(settings.language || 'en');
    }
  }, []);

  // Change language function
  const changeLanguage = (lang) => {
    setLanguage(lang);
    // Save to localStorage
    const savedSettings = localStorage.getItem('legistra_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.language = lang;
    localStorage.setItem('legistra_settings', JSON.stringify(settings));
  };

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
