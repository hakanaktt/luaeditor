import { LocalizedAdekoFunction } from '../types'

/**
 * Turkish Function Definitions for AdekoLib
 * 
 * Bu dosya AdekoLib fonksiyonlarının Türkçe tanımlarını içerir.
 */

export const turkishFunctionDefinitions: LocalizedAdekoFunction[] = [
  // GEOMETRİK DÖNÜŞÜMLER
  {
    name: 'rotate',
    description: 'Bir poligonu belirtilen açı kadar referans nokta etrafında döndürür. Hem saat yönünde hem de saat yönünün tersine dönüşü destekler.',
    parameters: [
      { name: 'polygon', type: 'table', description: 'Poligonu temsil eden nokta dizisi' },
      { name: 'reference', type: 'table', description: 'Dönüş merkezi için referans nokta {x, y}' },
      { name: 'theta', type: 'number', description: 'Derece cinsinden dönüş açısı' }
    ],
    returnType: 'table',
    returnDescription: 'Döndürülmüş poligon nokta dizisi olarak',
    example: 'local rotated = ADekoLib.rotate({{0,0}, {10,0}, {10,10}}, {5,5}, 45)',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['döndürme', 'dönüşüm', 'poligon'],
    complexity: 'basic',
    usage: 'Şekilleri konumlandırma veya yönlendirme değişiklikleri için pivot nokta etrafında döndürmek için kullanın',
    seeAlso: ['translate', 'mirror']
  },
  {
    name: 'translate',
    description: 'Polar koordinatlar kullanarak belirtilen yön ve mesafede bir poligonu hareket ettirir.',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Hareket ettirilecek nokta dizisi' },
      { name: 'theta', type: 'number', description: 'Derece cinsinden yön açısı' },
      { name: 'distance', type: 'number', description: 'Hareket mesafesi' }
    ],
    returnType: 'table',
    returnDescription: 'Hareket ettirilmiş poligon nokta dizisi olarak',
    example: 'local moved = ADekoLib.translate(points, 90, 50) -- 50 birim yukarı hareket ettir',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['öteleme', 'hareket', 'poligon'],
    complexity: 'basic',
    usage: 'Şekilleri yönelimini koruyarak farklı konumlara taşımak için kullanın',
    seeAlso: ['rotate', 'moveWithDeltaVec']
  },
  {
    name: 'moveWithDeltaVec',
    description: 'Her noktaya delta vektör ekleyerek noktaları hareket ettirir. Basit vektör toplama.',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Hareket ettirilecek nokta dizisi' },
      { name: 'vec', type: 'table', description: 'Delta vektör {dx, dy, dz}' }
    ],
    returnType: 'table',
    returnDescription: 'Delta vektör uygulanmış hareket ettirilmiş noktalar',
    example: 'local moved = ADekoLib.moveWithDeltaVec(points, {10, 20, 5})',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['hareket', 'vektör', 'öteleme'],
    complexity: 'basic',
    usage: 'Nokta koleksiyonlarının basit vektör tabanlı hareketi için kullanın',
    seeAlso: ['translate', 'ptAdd']
  },
  {
    name: 'mirror',
    description: 'Bir poligonu belirtilen eksen üzerinde aynalar. Yaylar için bulge değerlerini doğru şekilde işler.',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Aynalancak nokta dizisi' },
      { name: 'axis', type: 'string', description: 'Ayna ekseni: "x", "y", veya "xy"' },
      { name: 'X', type: 'number', description: 'Ayna çizgisinin X koordinatı' },
      { name: 'Y', type: 'number', description: 'Ayna çizgisinin Y koordinatı' }
    ],
    returnType: 'table',
    returnDescription: 'Aynalanan poligon nokta dizisi olarak',
    example: 'local mirrored = ADekoLib.mirror(points, "x", 100, 0)',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['ayna', 'yansıma', 'simetri'],
    complexity: 'basic',
    usage: 'Simetrik şekiller oluşturmak veya nesneleri bir eksen boyunca çevirmek için kullanın',
    seeAlso: ['rotate', 'translate']
  },

  // NOKTA VE VEKTÖR İŞLEMLERİ
  {
    name: 'distance',
    description: 'İki nokta arasındaki 2D Öklid mesafesini hesaplar.',
    parameters: [
      { name: 'p1', type: 'table', description: 'İlk nokta {x, y}' },
      { name: 'p2', type: 'table', description: 'İkinci nokta {x, y}' }
    ],
    returnType: 'number',
    returnDescription: 'İki nokta arasındaki mesafe',
    example: 'local dist = ADekoLib.distance({0, 0}, {3, 4}) -- 5 döndürür',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['mesafe', 'ölçüm', 'geometri'],
    complexity: 'basic',
    usage: 'Konumlandırma, doğrulama veya hesaplamalar için mesafeleri ölçmek için kullanın',
    seeAlso: ['distance3D', 'angle']
  },
  {
    name: 'distance3D',
    description: 'Z koordinatını da dahil ederek iki nokta arasındaki 3D Öklid mesafesini hesaplar.',
    parameters: [
      { name: 'p1', type: 'table', description: 'İlk nokta {x, y, z}' },
      { name: 'p2', type: 'table', description: 'İkinci nokta {x, y, z}' }
    ],
    returnType: 'number',
    returnDescription: 'İki nokta arasındaki 3D mesafe',
    example: 'local dist = ADekoLib.distance3D({0, 0, 0}, {1, 1, 1})',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['mesafe', '3D', 'ölçüm'],
    complexity: 'basic',
    usage: 'Uzamsal işlemlerde 3D mesafe hesaplamaları için kullanın',
    seeAlso: ['distance', 'vecNormalize']
  },
  {
    name: 'angle',
    description: 'p1 noktasından p2 noktasına açıyı derece cinsinden (0-360) hesaplar.',
    parameters: [
      { name: 'p1', type: 'table', description: 'Başlangıç noktası {x, y}' },
      { name: 'p2', type: 'table', description: 'Bitiş noktası {x, y}' }
    ],
    returnType: 'number',
    returnDescription: 'Derece cinsinden açı (0-360)',
    example: 'local angle = ADekoLib.angle({0, 0}, {1, 1}) -- 45 döndürür',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['açı', 'yön', 'geometri'],
    complexity: 'basic',
    usage: 'Döndürme veya yönlendirme için noktalar arası yönü belirlemek için kullanın',
    seeAlso: ['polar', 'rotate']
  },
  {
    name: 'polar',
    description: 'Bir temel noktaya göre polar koordinatlarda bir nokta döndürür.',
    parameters: [
      { name: 'p1', type: 'table', description: 'Temel nokta {x, y}' },
      { name: 'theta', type: 'number', description: 'Derece cinsinden açı' },
      { name: 'distance', type: 'number', description: 'Temel noktadan mesafe' }
    ],
    returnType: 'table',
    returnDescription: 'Polar koordinatlarda yeni nokta {x, y}',
    example: 'local point = ADekoLib.polar({0, 0}, 45, 10)',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['polar', 'koordinatlar', 'konumlandırma'],
    complexity: 'basic',
    usage: 'Belirli açı ve mesafelerde noktaları konumlandırmak için kullanın',
    seeAlso: ['angle', 'distance']
  },
  {
    name: 'ptAdd',
    description: 'İki nokta veya vektörü bileşen bazında toplar.',
    parameters: [
      { name: 'p1', type: 'table', description: 'İlk nokta/vektör {x, y, z}' },
      { name: 'p2', type: 'table', description: 'İkinci nokta/vektör {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'İki nokta/vektörün toplamı',
    example: 'local sum = ADekoLib.ptAdd({1, 2, 3}, {4, 5, 6})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['toplama', 'vektör', 'aritmetik'],
    complexity: 'basic',
    usage: 'Vektör toplama ve nokta yer değiştirme işlemleri için kullanın',
    seeAlso: ['ptSubtract', 'moveWithDeltaVec']
  },
  {
    name: 'ptSubtract',
    description: 'İkinci noktayı birinci noktadan bileşen bazında çıkarır.',
    parameters: [
      { name: 'p1', type: 'table', description: 'İlk nokta/vektör {x, y, z}' },
      { name: 'p2', type: 'table', description: 'İkinci nokta/vektör {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'İki nokta/vektörün farkı',
    example: 'local diff = ADekoLib.ptSubtract({5, 7, 9}, {1, 2, 3})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['çıkarma', 'vektör', 'aritmetik'],
    complexity: 'basic',
    usage: 'Yer değiştirme vektörleri veya göreceli konumları bulmak için kullanın',
    seeAlso: ['ptAdd', 'distance']
  },
  {
    name: 'vecNormalize',
    description: 'Bir vektörü birim uzunluğa (büyüklük = 1) normalleştirir.',
    parameters: [
      { name: 'v1', type: 'table', description: 'Normalleştirilecek vektör {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Büyüklüğü 1 olan normalleştirilmiş vektör',
    example: 'local unit = ADekoLib.vecNormalize({3, 4, 0})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['normalleştirme', 'vektör', 'birim'],
    complexity: 'intermediate',
    usage: 'Yön vektörleri almak veya hesaplamalar için normalleştirmek için kullanın',
    seeAlso: ['vecScale', 'distance3D']
  },
  {
    name: 'vecScale',
    description: 'Bir vektörü skaler faktörle ölçeklendirir.',
    parameters: [
      { name: 'v1', type: 'table', description: 'Ölçeklendirilecek vektör {x, y, z}' },
      { name: 'scale', type: 'number', description: 'Ölçek faktörü' }
    ],
    returnType: 'table',
    returnDescription: 'Ölçeklendirilmiş vektör',
    example: 'local scaled = ADekoLib.vecScale({1, 2, 3}, 2.5)',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['ölçeklendirme', 'vektör', 'çarpma'],
    complexity: 'basic',
    usage: 'Yönü koruyarak vektör büyüklüğünü değiştirmek için kullanın',
    seeAlso: ['vecNormalize', 'vecNegate']
  },
  {
    name: 'vecNegate',
    description: 'Bir vektörü negatifler (yönünü tersine çevirir).',
    parameters: [
      { name: 'v1', type: 'table', description: 'Negatiflenecek vektör {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Negatiflenmiş vektör',
    example: 'local opposite = ADekoLib.vecNegate({1, 2, 3})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['negatif', 'vektör', 'ters'],
    complexity: 'basic',
    usage: 'Vektör yönünü tersine çevirmek için kullanın',
    seeAlso: ['vecScale', 'ptSubtract']
  },

  // ŞEKİL OLUŞTURMA
  {
    name: 'circle',
    description: 'Düzgün eğriler için bulge değerleri kullanarak bir daire oluşturur. Bulge ile 4 nokta kullanır.',
    parameters: [
      { name: 'p', type: 'table', description: 'Merkez nokta {x, y}' },
      { name: 'r', type: 'number', description: 'Dairenin yarıçapı' }
    ],
    returnType: 'void',
    returnDescription: 'Mevcut şekilde daire geometrisi oluşturur',
    example: 'ADekoLib.circle({50, 50}, 25)',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['daire', 'şekil', 'geometri'],
    complexity: 'basic',
    usage: 'Delikler, dekoratif öğeler veya sınırlar için dairesel şekiller oluşturmak için kullanın',
    seeAlso: ['ellipse', 'hole']
  },
  {
    name: 'rectangle',
    description: 'İsteğe bağlı yuvarlatılmış köşelerle iki çapraz nokta arasında bir dikdörtgen oluşturur.',
    parameters: [
      { name: 'p1', type: 'table', description: 'İlk köşe noktası {x, y}' },
      { name: 'p2', type: 'table', description: 'Karşı köşe noktası {x, y}' },
      { name: 'bulge', type: 'number', description: 'Yuvarlatılmış köşeler için isteğe bağlı bulge', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Mevcut şekilde dikdörtgen geometrisi oluşturur',
    example: 'ADekoLib.rectangle({0, 0}, {100, 50})',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['dikdörtgen', 'şekil', 'temel'],
    complexity: 'basic',
    usage: 'Paneller, çerçeveler veya sınırlar için dikdörtgen şekiller oluşturmak için kullanın',
    seeAlso: ['line', 'makePart']
  },
  {
    name: 'line',
    description: 'Yaylar için isteğe bağlı bulge ile iki nokta arasında bir çizgi segmenti oluşturur.',
    parameters: [
      { name: 'p1', type: 'table', description: 'Başlangıç noktası {x, y}' },
      { name: 'p2', type: 'table', description: 'Bitiş noktası {x, y}' },
      { name: 'bulge', type: 'number', description: 'Yay için isteğe bağlı bulge', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Mevcut şekilde çizgi geometrisi oluşturur',
    example: 'ADekoLib.line({0, 0}, {100, 0})',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['çizgi', 'segment', 'temel'],
    complexity: 'basic',
    usage: 'Düz kenarlar, yapı çizgileri veya basit yollar oluşturmak için kullanın',
    seeAlso: ['polyline', 'dashLine']
  },
  {
    name: 'dashLine',
    description: 'Belirtilen segment sayısıyla iki nokta arasında kesikli çizgi oluşturur.',
    parameters: [
      { name: 'pt1', type: 'table', description: 'Başlangıç noktası {x, y, z}' },
      { name: 'pt2', type: 'table', description: 'Bitiş noktası {x, y, z}' },
      { name: 'segCou', type: 'number', description: 'Kesik segment sayısı', optional: true, defaultValue: 10 }
    ],
    returnType: 'void',
    returnDescription: 'Kesikli çizgi geometrisi oluşturur',
    example: 'ADekoLib.dashLine({0, 0}, {100, 0}, 5)',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['kesik', 'çizgi', 'segmentler'],
    complexity: 'intermediate',
    usage: 'Yapı veya görsel kılavuzlar için kesikli çizgiler oluşturmak için kullanın',
    seeAlso: ['line', 'polyline']
  },
  {
    name: 'ellipse',
    description: 'Belirtilen genişlik, yükseklik ve segment sayısıyla bir elips oluşturur.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Merkez nokta {x, y}' },
      { name: 'width', type: 'number', description: 'Elipsin genişliği' },
      { name: 'height', type: 'number', description: 'Elipsin yüksekliği' },
      { name: 'noOfSegments', type: 'number', description: 'Elipsi yaklaştırmak için çizgi segment sayısı' }
    ],
    returnType: 'table',
    returnDescription: 'Elipsi temsil eden nokta dizisi',
    example: 'local ellipsePoints = ADekoLib.ellipse({50, 50}, 80, 40, 32)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['elips', 'oval', 'eğri'],
    complexity: 'intermediate',
    usage: 'Oval şekiller veya eliptik sınırlar oluşturmak için kullanın',
    seeAlso: ['circle', 'ellipticArc']
  },
  {
    name: 'ellipticArc',
    description: 'Belirtilen parametreler ve açı aralığıyla eliptik yay oluşturur.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Merkez nokta {x, y}' },
      { name: 'width', type: 'number', description: 'Elipsin genişliği' },
      { name: 'height', type: 'number', description: 'Elipsin yüksekliği' },
      { name: 'noOfSegments', type: 'number', description: 'Çizgi segment sayısı' },
      { name: 'startAngle', type: 'number', description: 'Derece cinsinden başlangıç açısı' },
      { name: 'endAngle', type: 'number', description: 'Derece cinsinden bitiş açısı' }
    ],
    returnType: 'table',
    returnDescription: 'Eliptik yayı temsil eden nokta dizisi',
    example: 'local arc = ADekoLib.ellipticArc({50, 50}, 80, 40, 16, 0, 90)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['elips', 'yay', 'eğri'],
    complexity: 'intermediate',
    usage: 'Kısmi eliptik eğriler oluşturmak için kullanın',
    seeAlso: ['ellipse', 'circularArc']
  },
  {
    name: 'circularArc',
    description: 'Belirtilen çap ve açı aralığıyla dairesel yay oluşturur.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Merkez nokta {x, y}' },
      { name: 'diameter', type: 'number', description: 'Dairenin çapı' },
      { name: 'noOfSegments', type: 'number', description: 'Çizgi segment sayısı' },
      { name: 'startAngle', type: 'number', description: 'Derece cinsinden başlangıç açısı' },
      { name: 'endAngle', type: 'number', description: 'Derece cinsinden bitiş açısı' }
    ],
    returnType: 'table',
    returnDescription: 'Dairesel yayı temsil eden nokta dizisi',
    example: 'local arc = ADekoLib.circularArc({50, 50}, 40, 16, 0, 90)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['yay', 'daire', 'eğri'],
    complexity: 'intermediate',
    usage: 'Düzgün eğri yollar veya dekoratif yaylar oluşturmak için kullanın',
    seeAlso: ['ellipticArc', 'circle']
  },

  // ÇOK ÇİZGİ İŞLEMLERİ
  {
    name: 'polyline',
    description: 'Değişken sayıda noktadan çok çizgi oluşturur. Yaylar için bulge değerlerini destekler.',
    parameters: [
      { name: '...', type: 'table', description: 'Değişken sayıda nokta {x, y, z, bulge}' }
    ],
    returnType: 'void',
    returnDescription: 'Mevcut şekilde çok çizgi geometrisi oluşturur',
    example: 'ADekoLib.polyline({0,0}, {100,0}, {100,50}, {0,50})',
    category: 'Polyline Operations',
    subcategory: 'Creation',
    tags: ['çok-çizgi', 'yol', 'şekil'],
    complexity: 'basic',
    usage: 'Birden fazla bağlı noktadan karmaşık yollar ve şekiller oluşturmak için kullanın',
    seeAlso: ['line', 'polylineimp']
  },
  {
    name: 'polylineimp',
    description: 'Nokta dizisinden çok çizgi oluşturur. Büyük nokta dizileri için polyline() alternatifi.',
    parameters: [
      { name: 'inputPoints', type: 'table', description: 'Çok çizgiyi tanımlayan nokta dizisi' }
    ],
    returnType: 'void',
    returnDescription: 'Mevcut şekilde çok çizgi geometrisi oluşturur',
    example: 'ADekoLib.polylineimp({{0,0}, {100,0}, {100,50}, {0,50}})',
    category: 'Polyline Operations',
    subcategory: 'Creation',
    tags: ['çok-çizgi', 'dizi', 'yol'],
    complexity: 'basic',
    usage: 'Noktalarınız bir dizide olduğunda veya programatik olarak oluşturulan yollar için kullanın',
    seeAlso: ['polyline', 'joinPolylines']
  },

  // İŞLEME OPERASYONLARI
  {
    name: 'groove',
    description: 'Belirtilen derinlikte iki nokta arasında doğrusal oluk (kesim) oluşturur.',
    parameters: [
      { name: 'startPoint', type: 'table', description: 'Oluğun başlangıç noktası {x, y}' },
      { name: 'endPoint', type: 'table', description: 'Oluğun bitiş noktası {x, y}' },
      { name: 'depth', type: 'number', description: 'Oluğun derinliği (kesimler için negatif)' }
    ],
    returnType: 'void',
    returnDescription: 'Oluk işleme operasyonu oluşturur',
    example: 'ADekoLib.groove({10, 10}, {90, 10}, -5)',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['oluk', 'işleme', 'kesim'],
    complexity: 'basic',
    usage: 'Birleştirme, dekorasyon veya fonksiyonel oluklar için doğrusal kesimler oluşturmak için kullanın',
    seeAlso: ['hole', 'pocket']
  },
  {
    name: 'hole',
    description: 'Belirtilen konumda verilen yarıçap ve derinlikte dairesel delik oluşturur.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Deliğin merkez noktası {x, y}' },
      { name: 'radius', type: 'number', description: 'Deliğin yarıçapı' },
      { name: 'depth', type: 'number', description: 'Deliğin derinliği (kesimler için negatif)' }
    ],
    returnType: 'void',
    returnDescription: 'Delik işleme operasyonu oluşturur',
    example: 'ADekoLib.hole({50, 50}, 5, -10)',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['delik', 'delme', 'işleme'],
    complexity: 'basic',
    usage: 'Vidalar, dübeller veya dekoratif amaçlar için delikler oluşturmak için kullanın',
    seeAlso: ['circle', 'pocket']
  },
  {
    name: 'pocket',
    description: 'Takım kompanzasyonu ile dikdörtgen cep (alan kaldırma) oluşturur.',
    parameters: [
      { name: 'firstPoint', type: 'table', description: 'Cebin ilk köşesi {x, y}' },
      { name: 'secondPoint', type: 'table', description: 'Cebin karşı köşesi {x, y}' },
      { name: 'depth', type: 'number', description: 'Cebin derinliği (negatif)' },
      { name: 'cToolDiameter', type: 'number', description: 'Kesici takım çapı' }
    ],
    returnType: 'void',
    returnDescription: 'Cep işleme operasyonu oluşturur',
    example: 'ADekoLib.pocket({10, 10}, {90, 40}, -5, 6)',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['cep', 'işleme', 'alan-kaldırma'],
    complexity: 'intermediate',
    usage: 'Girintiler veya boşluklar için dikdörtgen alanlardan malzeme kaldırmak için kullanın',
    seeAlso: ['inclinedPocket', 'cleanCorners']
  }
]
