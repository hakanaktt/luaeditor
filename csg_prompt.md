# Augment Code AI Prompt: Lua (Turtle.lua) CSG Pipeline

## 🎯 Proje Amacı

Tauri tabanlı bir uygulamada çalışan, hem Rust hem TypeScript katmanları olan tam fonksiyonel bir Constructive Solid Geometry (CSG) Pipeline geliştirilecek.

CSG komutları doğrudan Lua betik çıktılarından (Turtle.lua) gelecek ve bunlar 3D Mesh üretimi için kullanılacak.

---

## 🧩 Girdi: Lua (Turtle.lua) Komut Çıktıları

Örneğin:

```lua
forward(10)
left(90)
circle(5)
extrude(20)
```

Bu komutlar önceden işlenmiş veya JSON formatında TypeScript'e ulaştırılacak:

```json
[
  { "op": "circle", "radius": 5 },
  { "op": "extrude", "height": 20 }
]
```

---

## 🏗️ Pipeline Adımları

### 1. Lua -> JSON Parslama (Rust veya Node.js tarafında)

* Lua betiği Tauri backend (Rust) veya Node.js ortamında yorumlanıp JSON CSG direktiflerine dönüştürülecek.
* (Lua yorumlayıcı: örn. `mlua`, `fengari`, veya dış Lua prosesi.)

### 2. TypeScript CSG Mesh Üretimi

* Kullanılacak kütüphaneler: `three.js`, `three-csg-ts`.
* JSON CSG direktifleri ile mesh üretilecek:

  * Primitives: `cube`, `cylinder`, `sphere`, `circle + extrude`.
  * Transformasyonlar: `translate`, `rotate`, `scale`.
  * Boolean CSG: `union`, `subtract`, `intersect`.

Örnek:

```typescript
const mesh = buildMeshFromLuaDirectives([
  { "op": "circle", "radius": 5 },
  { "op": "extrude", "height": 20 }
]);
```

#### Fonksiyon Beklentisi:

```typescript
type LuaDirective =
  | { op: 'circle', radius: number }
  | { op: 'extrude', height: number }
  | { op: 'cube', size: number }
  | { op: 'translate', x: number, y: number, z: number }
  | { op: 'rotate', axis: 'x'|'y'|'z', angle: number }
  | { op: 'union' | 'subtract' | 'intersect' };

function buildMeshFromLuaDirectives(directives: LuaDirective[]): THREE.Mesh { /* ... */ }
```

### 3. STL Export (Opsiyonel Kullanıcı İsteğine Bağlı)

* `STLExporter` ile mesh STL string’e çevrilecek.
* Kullanıcı "Export" derse bu STL Rust tarafına gönderilecek.

```typescript
const stlString = exporter.parse(finalMesh);
await invoke('save_stl', { data: stlString });
```

### 4. Rust Tarafı (Tauri Backend)

* `save_stl` Rust fonksiyonu STL dosyasını disk’e kaydeder.
* (Opsiyonel) Rust `stl_io` crate ile STL verisini parse edip doğrulayabilir.

```rust
#[tauri::command]
fn save_stl(data: String) -> Result<(), String> {
    std::fs::write("output.stl", data).map_err(|e| e.to_string())
}
```

### 5. Three.js Görsel Gösterim (Frontend)

* Oluşturulan mesh sahneye eklenip döner şekilde canvas üzerinde gösterilir.
* Malzeme: `MeshNormalMaterial` veya kullanıcı tanımlı.

---

## 🚨 Özel Koşullar

* Lua komutları 2D olabilir (ör: `circle`, `line`), bunlar otomatik olarak `extrude` ile 3D'ye dönüştürülecek.
* `forward`, `left`, `right` gibi turtle hareket komutları poligon path oluşturacak.
* TypeScript parser fonksiyonu bu path’leri `Shape` + `ExtrudeGeometry` haline çevirecek.

---

## ✅ Çıktılar (AI tarafından üretilecekler)

1. Lua JSON parser (isteğe bağlı Rust veya Node.js).
2. TypeScript Mesh Builder Fonksiyonu (CSG + Transform + Extrude).
3. Three.js render setup.
4. STL Export ve Tauri Rust command handler.
5. (İsteğe bağlı) Path-based extrude fonksiyonu (Turtle komutları için).

---

## 🎯 Sınırlamalar

* TypeScript tarafında Three.js ortamı kullanılacak.
* Rust sadece backend (STL kaydetme, doğrulama) işlerine dahil olacak.
* Performans kritik değil; doğru mesh üretimi öncelikli.

---

## 🔍 Ek İpuçları (AI için)

* Extrude işlemleri için `THREE.Shape()` + `ExtrudeGeometry` kullan.
* CSG boolean işlemler için `three-csg-ts` kullan.
* Transformasyonlar (translate, rotate, scale) Three.js `Object3D` API ile uygulanmalı.
* Rust tarafı binary STL export gerekirse güncellenebilir (`stl_io::create_stl`).
