# Lua Makro Editörü

Adeko Kütüphaneleri için geliştirilmiş modern bir Lua makro editörü. Bu uygulama, AdekoLib fonksiyonları için intellisense desteği ve kapsamlı dokümantasyon sağlar.

## Özellikler

### 🚀 Akıllı Kod Tamamlama
- **Bağlam Farkındalığı**: `ADekoLib.` yazarken otomatik tetiklenir
- **Bulanık Eşleştirme**: Kısmi isimlerle fonksiyonları bulur
- **Parametre Snippet'leri**: Parametre yer tutucularını otomatik oluşturur
- **Tür Bilgisi**: Parametre ve dönüş türlerini gösterir

### 📚 Fonksiyon Tarayıcısı
- **Kategori Navigasyonu**: Hiyerarşik fonksiyon gezinme
- **Gelişmiş Arama**: Çoklu filtre fonksiyon keşfi
- **Fonksiyon Detayları**: Kapsamlı dokümantasyon görüntüleme
- **Tek Tıkla Ekleme**: Doğrudan kod entegrasyonu

### 🎨 Modern Arayüz
- **Karanlık Tema**: Göz dostu Monaco editör
- **Dosya Gezgini**: Lua ve Model kütüphanesi desteği
- **Sekme Navigasyonu**: Dosyalar ve fonksiyonlar arası geçiş
- **Durum Çubuğu**: Gerçek zamanlı dosya durumu

### 🌍 Çok Dilli Destek
- **Türkçe**: Tam Türkçe arayüz ve dokümantasyon
- **İngilizce**: Varsayılan dil desteği
- **Otomatik Algılama**: Tarayıcı dili algılama

## Kurulum

### Gereksinimler
- Node.js 18+
- Rust (Tauri için)
- npm veya yarn

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run tauri:dev

# Üretim için derle
npm run tauri:build
```

## Kullanım

### Temel İşlemler
1. **Yeni Dosya**: Toolbar'dan "Yeni" butonuna tıklayın
2. **Dosya Aç**: Mevcut Lua dosyalarını açın
3. **Kaydet**: Değişiklikleri kaydedin
4. **Farklı Kaydet**: Yeni konuma kaydedin

### Fonksiyon Tarayıcısı
1. **Fonksiyonlar** sekmesine tıklayın
2. Kategorilere göz atın veya arama yapın
3. Fonksiyon detaylarını görüntüleyin
4. "Fonksiyon Ekle" ile koda ekleyin

### Intellisense Kullanımı
1. Editörde `ADekoLib.` yazın
2. Otomatik tamamlama listesi görünecek
3. İstediğiniz fonksiyonu seçin
4. Tab ile parametre yer tutucuları arasında gezinin

### Ayarlar
1. Toolbar'dan "Ayarlar" butonuna tıklayın
2. Model kütüphane yolunu ayarlayın
3. Dil tercihini seçin
4. Değişiklikleri kaydedin

## AdekoLib Fonksiyonları

### Kategoriler
- **🔧 Temel İşlemler**: Temel geometrik işlemler
- **📐 Geometrik Dönüşümler**: Döndürme, ölçekleme, çevirme
- **📊 Bilgi ve Hata Ayıklama**: Veri erişimi ve hata kontrolü
- **🎯 Gelişmiş İşlemler**: Karmaşık geometrik hesaplamalar

### Örnek Kullanım

```lua
-- Nokta döndürme
local rotatedPoint = ADekoLib.rotate(point, centerX, centerY, angle)

-- Çokgen çevirme
local translatedPolygon = ADekoLib.translate(polygon, direction, distance)

-- Daire oluşturma
local circle = ADekoLib.circle(centerX, centerY, radius, segments)
```

## Katkıda Bulunma

1. Projeyi fork edin
2. Özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Dalınızı push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Destek

Sorularınız veya sorunlarınız için:
- GitHub Issues kullanın
- Dokümantasyonu kontrol edin
- Topluluk forumlarına katılın

---

**Not**: Bu editör özellikle Adeko CAD/CAM yazılımı için Lua makroları geliştirmek üzere tasarlanmıştır.
