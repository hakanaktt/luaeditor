export default {
  // Uygulama başlığı ve marka
  app: {
    title: 'Lua Makro Editörü',
    subtitle: 'Adeko Kütüphaneleri için Lua Makro Editörü',
    welcome: 'Lua Makro Editörüne Hoş Geldiniz',
    welcomeMessage: 'Düzenlemeye başlamak için bir dosya açın veya AdekoLib fonksiyonlarına göz atın',
    noFileOpen: 'Açık dosya yok'
  },

  // Araç çubuğu eylemleri
  toolbar: {
    new: 'Yeni',
    open: 'Aç',
    save: 'Kaydet',
    saveAs: 'Farklı Kaydet',
    settings: 'Ayarlar',
    help: 'Yardım'
  },

  // Navigasyon sekmeleri
  tabs: {
    files: 'Dosyalar',
    functions: 'Fonksiyonlar'
  },

  // Ayarlar modalı
  settings: {
    title: 'Ayarlar',
    modelLibraryPath: 'Model Kütüphane Yolu',
    selectModelLibraryDirectory: 'Model kütüphane dizinini seçin...',
    currentPaths: 'Mevcut Yollar:',
    model: 'Model:',
    luaAutoDetected: 'Lua (otomatik algılandı):',
    notSet: 'Ayarlanmadı',
    notAvailable: 'Mevcut değil',
    autoDetectionNote: 'Lua kütüphanesi, model kütüphanesinin kardeş klasörü olarak otomatik olarak algılanacaktır.',
    language: 'Dil',
    sidebarWidth: 'Kenar Çubuğu Genişliği',
    sidebarWidthNote: 'Kenar çubuğu panelinin genişliğini ayarlayın (200-600px). Ayrıca kenar çubuğu kenarını sürükleyerek yeniden boyutlandırabilirsiniz.',
    cancel: 'İptal',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    saveError: 'Ayarlar kaydedilemedi. Lütfen tekrar deneyin.'
  },

  // Fonksiyon tarayıcısı
  functions: {
    searchPlaceholder: 'Fonksiyon ara...',
    allCategories: 'Tüm Kategoriler',
    allLevels: 'Tüm Seviyeler',
    basic: 'Temel',
    intermediate: 'Orta',
    advanced: 'İleri',
    functionsCount: 'fonksiyon',
    insertFunction: 'Fonksiyon Ekle',
    parameters: 'Parametreler',
    returns: 'Döndürür',
    example: 'Örnek',
    usage: 'Kullanım',
    relatedFunctions: 'İlgili Fonksiyonlar',
    optional: 'isteğe bağlı'
  },

  // Dosya işlemleri
  files: {
    luaFiles: 'Lua Dosyaları',
    newFileComment: '-- Yeni Lua dosyası\n-- Adeko makro kodunuzu buraya ekleyin\n\n'
  },

  // Dosya Gezgini Bağlam Menüsü
  fileExplorer: {
    newFile: 'Yeni Dosya',
    newFolder: 'Yeni Klasör',
    rename: 'Yeniden Adlandır',
    delete: 'Sil',
    copy: 'Kopyala',
    cut: 'Kes',
    paste: 'Yapıştır',
    refresh: 'Yenile',
    openInExplorer: 'Dosya Gezgininde Aç',
    navigateTo: 'Klasöre Git',
    properties: 'Özellikler',
    confirmDelete: '"{name}" dosyasını silmek istediğinizden emin misiniz?',
    confirmDeleteMultiple: '{count} öğeyi silmek istediğinizden emin misiniz?',
    enterFileName: 'Dosya adını girin:',
    enterFolderName: 'Klasör adını girin:',
    enterNewName: 'Yeni adı girin:',
    fileExists: 'Bu adda bir dosya zaten mevcut',
    folderExists: 'Bu adda bir klasör zaten mevcut',
    invalidName: 'Geçersiz dosya/klasör adı',
    createFileError: 'Dosya oluşturulamadı',
    createFolderError: 'Klasör oluşturulamadı',
    deleteError: 'Silinemedi',
    renameError: 'Yeniden adlandırılamadı',
    copyError: 'Kopyalanamadı',
    pasteError: 'Yapıştırılamadı',
    refreshError: 'Dizin yenilenemedi',
    noItemsSelected: 'Hiçbir öğe seçilmedi',
    cannotCopyToSelf: 'Öğe kendisine kopyalanamaz',
    cannotMoveToSelf: 'Öğe kendisine taşınamaz',
    expandFolder: 'Klasörü genişlet',
    collapseFolder: 'Klasörü daralt',
    loadingFolder: 'Klasör içeriği yükleniyor...'
  },

  // Hata mesajları
  errors: {
    openingFile: 'Dosya açılırken hata:',
    savingFile: 'Dosya kaydedilirken hata:',
    loadingFile: 'Dosya yüklenirken hata:',
    loadingSettings: 'Ayarlar yüklenirken hata:',
    calculatingLuaPath: 'Lua kütüphane yolu hesaplanırken hata:',
    selectingModelLibraryPath: 'Model kütüphane yolu seçilirken hata:'
  },

  // Durum mesajları
  status: {
    modified: '●',
    luaMacroEditor: 'Lua Makro Editörü',
    initialized: 'Lua Makro Editörü başlatıldı',
    directoryNotExist: 'Lua kütüphane dizini mevcut değil:'
  },

  // Diller
  languages: {
    en: 'English',
    tr: 'Türkçe'
  },

  // Ortak UI öğeleri
  common: {
    loading: 'Yükleniyor...',
    error: 'Hata',
    directoryNotFound: 'Dizin bulunamadı:',
    noDirectorySpecified: 'Dizin belirtilmedi'
  }
}
