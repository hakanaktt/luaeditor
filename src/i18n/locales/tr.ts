export default {
  // Uygulama başlığı ve marka
  app: {
    title: 'Adeko Lua Editörü',
    subtitle: 'Adeko CAM Kütüphaneleri için Lua Editörü',
    welcome: 'Adeko Lua Editörüne Hoş Geldiniz',
    welcomeMessage: 'Düzenlemeye başlamak için bir dosya açın veya AdekoCAM fonksiyonlarına göz atın',
    noFileOpen: 'Açık dosya yok'
  },

  // Menü çubuğu
  menu: {
    file: 'Dosya',
    edit: 'Düzenle',
    view: 'Görünüm',
    debug: 'Hata Ayıklama',
    tools: 'Araçlar',
    help: 'Yardım'
  },

  // Dosya menüsü
  fileMenu: {
    new: 'Yeni',
    open: 'Aç',
    save: 'Kaydet',
    saveAs: 'Farklı Kaydet',
    recentFiles: 'Son Dosyalar',
    clearRecentFiles: 'Son Dosyaları Temizle',
    exit: 'Çıkış'
  },

  // Düzenle menüsü
  editMenu: {
    undo: 'Geri Al',
    redo: 'Yinele',
    cut: 'Kes',
    copy: 'Kopyala',
    paste: 'Yapıştır',
    selectAll: 'Tümünü Seç',
    find: 'Bul',
    replace: 'Değiştir',
    findNext: 'Sonrakini Bul',
    findPrevious: 'Öncekini Bul'
  },

  // Görünüm menüsü
  viewMenu: {
    toggleSidebar: 'Kenar Çubuğunu Aç/Kapat',
    toggleFunctionBrowser: 'Fonksiyon Tarayıcısını Aç/Kapat',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    resetZoom: 'Yakınlaştırmayı Sıfırla',
    fullscreen: 'Tam Ekranı Aç/Kapat'
  },

  // Hata ayıklama menüsü
  debugMenu: {
    runScript: 'Betiği Çalıştır',
    runWithDebug: 'Hata Ayıklama Modunda Çalıştır',
    stopExecution: 'Çalıştırmayı Durdur',
    clearConsole: 'Konsolu Temizle',
    toggleConsole: 'Hata Ayıklama Konsolunu Aç/Kapat'
  },

  // Araçlar menüsü
  toolsMenu: {
    settings: 'Ayarlar',
    functionBrowser: 'Fonksiyon Tarayıcısı',
    validateLua: 'Lua Sözdizimini Doğrula',
    formatCode: 'Kodu Biçimlendir',
    insertFunction: 'Fonksiyon Ekle'
  },

  // Yardım menüsü
  helpMenu: {
    documentation: 'Belgeler',
    keyboardShortcuts: 'Klavye Kısayolları',
    about: 'Hakkında',
    reportIssue: 'Sorun Bildir'
  },

  // Hakkında modal
  about: {
    title: 'Adeko Lua Editörü Hakkında',
    version: 'Sürüm',
    author: 'Yazar',
    authorName: 'Hakan Ak',
    description: 'Adeko CAM kütüphaneleri için özel olarak tasarlanmış gelişmiş IntelliSense, hata ayıklama yetenekleri ve turtle grafik görselleştirmesi ile güçlü bir Lua script editörü.',
    features: 'Temel Özellikler',
    featureList: [
      'Gelişmiş Lua sözdizimi vurgulama ve IntelliSense',
      '200+ fonksiyonlu entegre AdekoLib fonksiyon tarayıcısı',
      'Gerçek zamanlı Lua sözdizimi doğrulama ve hata kontrolü',
      'Turtle grafik görselleştirmesi ile hata ayıklama modu',
      'Çoklu dil desteği (İngilizce/Türkçe)',
      'Proje dosya yönetimi ve organizasyonu',
      'Yerleşik kod biçimlendirme ve doğrulama araçları'
    ],
    copyright: '© 2024 Adeko. Tüm hakları saklıdır.',
    builtWith: 'Geliştirildiği teknolojiler',
    technologies: 'Vue 3, TypeScript, Tauri, Rust, Monaco Editor',
    close: 'Kapat'
  },

  // Lua doğrulama
  luaValidation: {
    validating: 'Lua sözdizimi doğrulanıyor...',
    valid: 'Lua sözdizimi geçerli',
    invalid: 'Lua sözdizimi hataları bulundu',
    noFileOpen: 'Doğrulanacak açık dosya yok',
    errors: 'Sözdizimi Hataları',
    line: 'Satır',
    column: 'Sütun',
    message: 'Mesaj'
  },



  // Navigasyon sekmeleri
  tabs: {
    files: 'Dosyalar',
    functions: 'Fonksiyonlar',
    visualization: 'Görselleştirme'
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
    searchPlaceholder: 'Dosyaları ara...',
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

  // Fonksiyon kategorileri
  functionCategories: {
    'Geometric Transformations': 'Geometrik Dönüşümler',
    'Point & Vector Operations': 'Nokta ve Vektör İşlemleri',
    'Shape Generation': 'Şekil Oluşturma',
    'Polyline Operations': 'Çok Çizgi İşlemleri',
    'Machining Operations': 'İşleme Operasyonları',
    'Analysis & Testing': 'Analiz ve Test',
    'Utilities': 'Yardımcı Araçlar'
  },

  // Fonksiyon kategori açıklamaları
  functionCategoryDescriptions: {
    'Geometric Transformations': 'Şekilleri döndürme, öteleme, aynalama ve ölçeklendirme fonksiyonları',
    'Point & Vector Operations': 'Nokta hesaplamaları, mesafeler, açılar ve vektör işlemleri fonksiyonları',
    'Shape Generation': 'Temel ve karmaşık geometrik şekiller oluşturma fonksiyonları',
    'Polyline Operations': 'Çok çizgi ve yolları oluşturma, değiştirme ve manipüle etme fonksiyonları',
    'Machining Operations': 'Delik, oluk ve cep gibi işleme operasyonları oluşturma fonksiyonları',
    'Analysis & Testing': 'Geometrik analiz, çarpışma tespiti ve doğrulama fonksiyonları',
    'Utilities': 'Sıralama, düzenleme ve veri manipülasyonu için yardımcı fonksiyonlar'
  },

  // Dosya işlemleri
  files: {
    luaFiles: 'Lua Dosyaları',
    newFileComment: '-- Yeni Lua dosyası\n-- Kodunuzu buraya ekleyin\n\n'
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
    luaMacroEditor: 'Adeko Lua Editörü',
    initialized: 'Adeko Lua Editörü başlatıldı',
    directoryNotExist: 'Lua kütüphane dizini mevcut değil:'
  },

  // Diller
  languages: {
    en: 'English',
    tr: 'Türkçe'
  },

  // Hata ayıklama konsolu
  debugConsole: {
    title: 'Hata Ayıklama Konsolu',
    running: 'Betik çalıştırılıyor...',
    completed: 'Betik çalıştırma tamamlandı',
    failed: 'Betik çalıştırma başarısız',
    stopped: 'Betik çalıştırma durduruldu',
    executionTime: 'Çalıştırma süresi: {time}ms',
    noOutput: 'Çıktı yok',
    clearConsole: 'Konsolu Temizle',
    copyOutput: 'Çıktıyı Kopyala',
    saveOutput: 'Çıktıyı Dosyaya Kaydet',
    toggleTurtleGraphics: 'Grafikleri Aç/Kapat',
    debugMode: 'Hata Ayıklama Modu',
    faceLayout: '6-Yüz Düzeni Aktif',
    drawCommands: 'çizim komutu yakalandı'
  },

  // Turtle Canvas
  turtleCanvas: {
    title: '2D Grafikler',
    commands: 'komut',
    resetView: 'Görünümü Sıfırla',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    minimize: 'Küçült'
  },

  // Görselleştirme Paneli
  visualization: {
    title: 'Görselleştirme',
    commands: 'komut',
    clear: 'Görselleştirmeyi Temizle',
    expand: 'Görselleştirmeyi Genişlet',
    collapse: 'Görselleştirmeyi Daralt',
    noData: 'Görselleştirme verisi yok',
    runScriptHint: 'Turtle grafiklerini görmek için hata ayıklama modunda bir betik çalıştırın',
    turtleGraphicsMinimized: 'Turtle Grafikleri (Küçültülmüş)',
    restore: 'Geri Yükle'
  },

  // Araç çubuğu
  toolbar: {
    fileOpen: 'Dosya Açık',
    noFile: 'Dosya Yok',
    new: 'Yeni',
    open: 'Aç',
    save: 'Kaydet',
    saveAs: 'Farklı Kaydet',
    settings: 'Ayarlar',
    help: 'Yardım'
  },

  // Ortak UI öğeleri
  common: {
    loading: 'Yükleniyor...',
    error: 'Hata',
    directoryNotFound: 'Dizin bulunamadı:',
    noDirectorySpecified: 'Dizin belirtilmedi',
    close: 'Kapat'
  },

  // Klavye kısayolları
  keyboardShortcuts: {
    title: 'Klavye Kısayolları',
    categories: {
      file: 'Dosya İşlemleri',
      edit: 'Düzenleme İşlemleri',
      view: 'Görünüm İşlemleri',
      tools: 'Araçlar',
      help: 'Yardım'
    },
    tips: {
      title: 'İpuçları',
      editorFocus: 'Çoğu kısayol editör odaklandığında çalışır',
      globalShortcuts: 'Fonksiyon tuşları (F1, F2, F7) global olarak çalışır',
      menuAccess: 'Bu komutlara menü çubuğundan da erişebilirsiniz'
    }
  }
}
