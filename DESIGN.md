# DESIGN.md

## 1. Architecture & Data Model

### 1.1 How you structured your NestJS modules and layers

#### English

##### Module Organization

The application follows a **domain-driven design (DDD)** approach with clear separation of concerns. The project is organized into three main domain modules, each representing a core business entity:

**1. AgentsModule**
- **Purpose**: Manages real estate agents (consultants)
- **Location**: `src/agents/`
- **Structure**:
  ```
  agents/
  ├── agents.controller.ts      # HTTP endpoints for agent operations
  ├── agents.service.ts          # Business logic for agents
  ├── agents.repository.ts       # Data access layer for agents
  ├── agents.module.ts           # Module definition and dependencies
  ├── schema/
  │   └── agent.schema.ts        # MongoDB schema definition
  └── dto/
      ├── create.agent.dto.ts    # Request DTO for creating agents
      └── agent.response.dto.ts  # Response DTO for agent data
  ```

**2. TransactionsModule**
- **Purpose**: Manages transaction lifecycle and stage transitions
- **Location**: `src/transactions/`
- **Structure**:
  ```
  transactions/
  ├── transactions.controller.ts # HTTP endpoints for transactions
  ├── transactions.service.ts    # Business logic (stage transitions, history)
  ├── transactions.repository.ts # Data access layer
  ├── transactions.module.ts     # Module definition
  ├── schema/
  │   └── transaction.schema.ts  # MongoDB schema
  ├── dto/                       # Data Transfer Objects
  │   ├── create.transaction.dto.ts
  │   ├── update.stage.transaction.dto.ts
  │   ├── add.agent.dto.ts
  │   └── transaction.response.dto.ts
  ├── types/                     # TypeScript type definitions
  │   ├── transaction-history.type.ts
  │   └── financial-breakdown.type.ts
  └── templates/                 # PDF report templates
      ├── financial-breakdown.template.html
      └── transaction-history.template.html
  ```

**3. CommissionModule**
- **Purpose**: Handles commission calculation and distribution
- **Location**: `src/commission/`
- **Structure**:
  ```
  commission/
  ├── commission.controller.ts   # HTTP endpoints (currently minimal)
  ├── commission.service.ts      # Commission calculation logic
  ├── commission.repository.ts   # Data access layer
  ├── commission.module.ts       # Module definition
  ├── schema/
  │   └── commission.schema.ts   # MongoDB schema
  └── dto/
      └── create-commission.dto.ts
  ```

##### Architecture Layers

The application uses a **layered architecture** with clear separation between HTTP layer, business logic, and data access:

```
┌─────────────────────────────────────────────┐
│          Controller Layer (HTTP)            │
│  - Handles HTTP requests/responses          │
│  - Input validation via DTOs                │
│  - Error handling                           │
│  - Swagger documentation                     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Service Layer (Business Logic)     │
│  - Implements business rules                │
│  - Orchestrates operations                  │
│  - Validates business constraints           │
│  - Coordinates between repositories         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       Repository Layer (Data Access)        │
│  - Abstracts MongoDB operations             │
│  - Handles database queries                 │
│  - Manages data transformation              │
│  - Provides clean interface to services     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Schema Layer (Data Models)          │
│  - Defines MongoDB schemas                  │
│  - Type definitions                         │
│  - Relationships between entities           │
└─────────────────────────────────────────────┘
```

##### Layer Responsibilities

**Controller Layer:**
- Receives HTTP requests
- Validates input using DTOs with class-validator decorators
- Calls appropriate service methods
- Returns HTTP responses with proper status codes
- Handles exceptions and formats error responses

**Service Layer:**
- Contains core business logic
- Implements business rules (e.g., commission calculation, stage transitions)
- Coordinates between multiple repositories if needed
- Validates business constraints
- Throws domain-specific exceptions

**Repository Layer:**
- Provides abstraction over MongoDB/Mongoose operations
- Handles complex queries and aggregations
- Manages data persistence
- Returns domain models (Documents)
- Keeps service layer unaware of database implementation details

**Schema Layer:**
- Defines data structure and validation rules
- Establishes relationships between collections
- Provides TypeScript types for type safety

##### Module Dependencies

**AppModule** (Root Module)
- Imports all domain modules
- Configures global modules (ConfigModule, MongooseModule)
- Sets up MongoDB connection

```
AppModule
├── ConfigModule (global)
├── MongooseModule.forRootAsync (global MongoDB connection)
├── AgentsModule
├── TransactionsModule
└── CommissionModule
```

**Inter-Module Dependencies:**

```
TransactionsModule
├── imports: CommissionModule (for commission calculation)
├── imports: AgentsModule (for agent operations)
└── providers: PdfService (shared service)

CommissionModule
└── exports: CommissionService (used by TransactionsModule)

AgentsModule
└── exports: AgentsService (used by TransactionsModule)
```

##### Why This Structure?

1. **Domain-Driven Design**: Each module represents a clear business domain
2. **Separation of Concerns**: Each layer has a single, well-defined responsibility
3. **Testability**: Business logic is isolated and easily testable without HTTP or database
4. **Maintainability**: Changes in one layer don't cascade to others
5. **Scalability**: Easy to add new features or modules without affecting existing code
6. **Reusability**: Services and repositories can be reused across different contexts

##### Additional Shared Components

**Common Module** (`src/common/`)
- **Filters**: Global exception filter for consistent error responses
- **Interceptors**: Logging interceptor for request/response logging

**Services** (`src/services/`)
- **PdfService**: Shared service for PDF generation, used by TransactionsModule

### 1.2 Financial Breakdown and Commission Calculation

#### English

##### Commission Calculation Flow

When a transaction's stage changes to `completed`, the system automatically triggers the `calculateCommission` method. This method:

1. **Retrieves Transaction Data**: Gets the completed transaction with its listing and selling agents
2. **Applies Business Rules**: Calculates commission according to the documented rules:
   - 50% of total fee goes to the agency
   - Remaining 50% is distributed among agents based on scenarios
3. **Creates Commission Record**: Saves the calculated commission in the Commissions collection
4. **Adds to Transaction History**: Records the commission calculation in the transaction's history with detailed agent information

##### Financial Breakdown Endpoint

The financial breakdown endpoint (`GET /transactions/financialBreakdown`) provides a comprehensive report:

**How it Works:**
1. **Queries Completed Transactions**: Uses MongoDB aggregation to find all transactions with stage = 'completed'
2. **Joins with Commissions**: Performs a `$lookup` to join transactions with their corresponding commission records
3. **Joins with Agents**: Performs another `$lookup` to enrich commission data with agent details (name, surname, email)
4. **Returns Detailed Report**: Each transaction includes:
   - Transaction details (ID, name, description)
   - Commission breakdown (agency amount, agent amounts)
   - Agent information for each commission entry

**Why This Approach:**
- **Stored Data**: Since commissions are calculated and stored when a transaction completes, we can join them efficiently
- **Performance**: Using aggregation with `$lookup` is more efficient than calculating on-the-fly
- **Data Integrity**: Commission calculations are immutable, ensuring historical accuracy
- **Detailed Reporting**: Agent information is stored in commission records, enabling comprehensive reports

##### PDF Generation

The system also provides PDF export functionality:

- **Endpoint**: `GET /transactions/financialBreakdown/pdf`
- **Generates**: A professionally formatted PDF report with all financial breakdown data
- **Uses**: Puppeteer to convert HTML templates to PDF
- **Features**: 
  - Styled tables and sections
  - Transaction details
  - Commission breakdowns
  - Agent information

### 1.3 Transaction Stage Transition Logic

#### English

##### Forward and Backward Stage Transitions

The system controls stage transitions by comparing the incoming new stage with the transaction's current stage:

**Forward Transitions (Strict Validation):**

The system validates forward transitions by comparing the new stage with the transaction's current stage:

1. **agreement stage**:
   - For new transactions: current stage must be `null` or `undefined`
   - This is the initial stage where all transactions start

2. **earnest_money stage**:
   - Current stage can be `agreement`, `null`, or `undefined`
   - This allows transactions that start directly with payment (customer may deposit money immediately)

3. **title_deed stage**:
   - Current stage must be `earnest_money`
   - Strict validation: cannot skip from agreement directly to title_deed

4. **completed stage**:
   - Current stage must be `title_deed`
   - Strict validation: must go through all previous stages

**Backward Transitions (No Validation):**

For backward transitions (moving to an earlier stage than the current stage), the system does not apply any validation:
- A transaction can move backward from any stage to any earlier stage
- This allows handling cases where:
  - A transaction may be broken or canceled
  - Stages need to be reset
  - Business processes require reverting to earlier stages

**Why This Approach:**
- **Forward Validation**: Ensures business process integrity by enforcing the correct stage sequence
- **Backward Flexibility**: Allows recovery from errors and handling of exceptional cases
- **Current Stage Comparison**: Compares incoming new stage with the transaction's current stage to determine if transition is forward or backward
- **Flexible Initial Stage**: Allows transactions to start at earnest_money if payment is immediate

---

#### Türkçe

##### İleriye ve Geriye Dönük Aşama Geçişleri

Sistem, aşama geçişlerinin ileriye mi geriye mi dönük olduğunu kontrol ederek stage transition'ları yönetir:

**İleriye Dönük Geçişler (Katı Validasyon):**

Sistem, veritabanında saklanan `previousStage` alanına bakarak ileriye dönük geçişleri doğrular:

1. **agreement aşaması**:
   - Yeni transaction'lar için: `previousStage` `null` veya `undefined` olmalı
   - Tüm transaction'ların başladığı başlangıç aşamasıdır

2. **earnest_money aşaması**:
   - `previousStage` `agreement`, `null` veya `undefined` olabilir
   - Müşteri parayı hemen yatırmış olabileceği için, direkt ödeme ile başlayan transaction'lara izin verir

3. **title_deed aşaması**:
   - `previousStage` `earnest_money` olmalı
   - Katı validasyon: agreement'dan direkt title_deed'e geçilemez

4. **completed aşaması**:
   - `previousStage` `title_deed` olmalı
   - Katı validasyon: önceki tüm aşamalardan geçilmiş olmalı

**Geriye Dönük Geçişler (Validasyon Yok):**

Geriye dönük geçişlerde (daha önceki bir aşamaya geri dönme) sistem herhangi bir validasyon uygulamaz:
- Bir transaction herhangi bir aşamadan daha önceki herhangi bir aşamaya geri dönebilir
- Bu şu durumları ele almayı sağlar:
  - Transaction bozulmuş veya iptal edilmiş olabilir
  - Aşamaların sıfırlanması gerekebilir
  - İş süreçleri daha önceki aşamalara dönüş gerektirebilir

**Neden Bu Yaklaşım:**
- **İleriye Dönük Validasyon**: Doğru aşama sırasını zorunlu kılarak iş süreci bütünlüğünü sağlar
- **Geriye Dönük Esneklik**: Hatalardan kurtulmayı ve istisnai durumları ele almayı sağlar
- **Veritabanı Odaklı**: Geçmişi takip etmek ve geçişleri doğrulamak için `previousStage` alanını kullanır
- **Esnek Başlangıç Aşaması**: Ödeme hemen yapılmışsa transaction'ların earnest_money'den başlamasına izin verir

##### What alternatives you rejected and why

**Alternative 1: Monolithic Module Structure (All schemas in one module)**

**Rejected Approach:**
Putting all schemas (agents, transactions, commissions) in a single module without separation.

**Why Rejected:**
- **Readability Issues**: In non-modular projects where each schema is not in a different module, the application becomes harder to read. All controllers, services, and repositories would be mixed together, making it difficult to understand the codebase structure.
- **Testability Problems**: Without modular structure, testing becomes more difficult. Business logic would be tightly coupled, making it hard to isolate and test individual components. Each schema would not have its own dedicated module, making unit testing and mocking more complex.
- **Maintainability Concerns**: Any changes to one domain (e.g., agents) would affect the entire codebase, increasing the risk of breaking changes.
- **Scalability Limitations**: Adding new features or domains would require modifying the same large files, leading to merge conflicts and code complexity.

---

## 2. Most Challenging / Riskiest Part

### 2.1 What design decision was risky?

**The Risk: Modular Architecture Complexity**

As a design decision, the modular structure has some risks. Some of these risks include that as the number of modules increases, processes such as code readability and managing dependencies between schemas become more challenging. The complexity grows when:
- Multiple modules need to interact with each other
- Dependencies between schemas become hard to track
- Code navigation becomes difficult across module boundaries
- Understanding the overall system architecture requires deep knowledge of all modules

**How it was mitigated:**

I solved this by:
1. **Writing Clean Code**: Following clean code principles ensures each module, service, and repository has clear, self-documenting code that is easy to understand.
2. **Single Responsibility Principle**: Each module, class, and method has a single, well-defined responsibility. This makes dependencies explicit and easier to manage.
3. **Clear Module Boundaries**: Each module exports only what is necessary, preventing tight coupling.
4. **Well-Documented Interfaces**: Service interfaces and DTOs clearly define how modules interact.
5. **Consistent Naming Conventions**: Following consistent naming patterns makes it easier to navigate and understand the codebase.

**Risk Level**: Medium
- **Impact if wrong**: Code becomes hard to maintain and understand, dependencies become unmanageable
- **Likelihood**: Low (mitigated through clean code and design principles)
- **Mitigation effectiveness**: High

---

## 3. If Implemented in Real Life — What Next?

### 3.1 What would be the next features or improvements?

The following features and improvements would be prioritized:

**1. Authentication & Authorization with Token System**
- Implement JWT-based authentication
- Role-based access control (RBAC)
- Define which users can access the system
- Specify what operations each user role can perform
- User management system
- Secure API endpoints

**2. Advanced Logging System (Quickwit Integration)**
- Currently, the system has a good logging mechanism
- Next step would be to move logs to a centralized system like Quickwit
- Enable better log aggregation, search, and analysis
- Improve debugging and monitoring capabilities
- Real-time log insights

**3. Enhanced Reporting with AI Integration**
- Currently implemented: Transaction history and financial breakdown PDF reports
- Next improvements:
  - More detailed transaction reports
  - AI integration to analyze transaction success rates
  - Predictive analytics: Which transactions are more likely to succeed?
  - Data-driven insights for business decisions
  - Machine learning models for transaction outcome prediction

**4. Redis Caching Layer**
- Implement Redis to cache frequently accessed data
- Reduce MongoDB Atlas queries
- Lower database costs
- Improve response times
- Cache invalidation strategies for data consistency

---

#### Türkçe

##### Modül Organizasyonu

Uygulama, sorumlulukların net bir şekilde ayrıldığı **domain-driven design (DDD)** yaklaşımını izler. Proje, her biri temel bir iş varlığını temsil eden üç ana domain modülüne organize edilmiştir:

**1. AgentsModule**
- **Amaç**: Emlak danışmanlarını (agent) yönetir
- **Konum**: `src/agents/`
- **Yapı**:
  ```
  agents/
  ├── agents.controller.ts      # Agent işlemleri için HTTP endpoint'leri
  ├── agents.service.ts          # Agent iş mantığı
  ├── agents.repository.ts       # Agent veri erişim katmanı
  ├── agents.module.ts           # Modül tanımı ve bağımlılıklar
  ├── schema/
  │   └── agent.schema.ts        # MongoDB şema tanımı
  └── dto/
      ├── create.agent.dto.ts    # Agent oluşturma için request DTO
      └── agent.response.dto.ts  # Agent verisi için response DTO
  ```

**2. TransactionsModule**
- **Amaç**: Transaction yaşam döngüsünü ve aşama geçişlerini yönetir
- **Konum**: `src/transactions/`
- **Yapı**:
  ```
  transactions/
  ├── transactions.controller.ts # Transaction HTTP endpoint'leri
  ├── transactions.service.ts    # İş mantığı (aşama geçişleri, history)
  ├── transactions.repository.ts # Veri erişim katmanı
  ├── transactions.module.ts     # Modül tanımı
  ├── schema/
  │   └── transaction.schema.ts  # MongoDB şema
  ├── dto/                       # Data Transfer Objects
  │   ├── create.transaction.dto.ts
  │   ├── update.stage.transaction.dto.ts
  │   ├── add.agent.dto.ts
  │   └── transaction.response.dto.ts
  ├── types/                     # TypeScript tip tanımları
  │   ├── transaction-history.type.ts
  │   └── financial-breakdown.type.ts
  └── templates/                 # PDF rapor şablonları
      ├── financial-breakdown.template.html
      └── transaction-history.template.html
  ```

**3. CommissionModule**
- **Amaç**: Komisyon hesaplama ve dağıtımını yönetir
- **Konum**: `src/commission/`
- **Yapı**:
  ```
  commission/
  ├── commission.controller.ts   # HTTP endpoint'leri (şu an minimal)
  ├── commission.service.ts      # Komisyon hesaplama mantığı
  ├── commission.repository.ts   # Veri erişim katmanı
  ├── commission.module.ts       # Modül tanımı
  ├── schema/
  │   └── commission.schema.ts   # MongoDB şema
  └── dto/
      └── create-commission.dto.ts
  ```

##### Mimari Katmanlar

Uygulama, HTTP katmanı, iş mantığı ve veri erişimi arasında net bir ayrım olan **katmanlı mimari** kullanır:

```
┌─────────────────────────────────────────────┐
│       Controller Katmanı (HTTP)            │
│  - HTTP isteklerini/yanıtlarını yönetir    │
│  - DTO'lar ile giriş doğrulaması           │
│  - Hata yönetimi                            │
│  - Swagger dokümantasyonu                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     Service Katmanı (İş Mantığı)           │
│  - İş kurallarını uygular                   │
│  - Operasyonları orkestre eder              │
│  - İş kısıtlamalarını doğrular              │
│  - Repository'ler arasında koordinasyon     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    Repository Katmanı (Veri Erişimi)       │
│  - MongoDB işlemlerini soyutlar             │
│  - Veritabanı sorgularını yönetir           │
│  - Veri dönüşümlerini işler                 │
│  - Servislere temiz arayüz sağlar           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      Schema Katmanı (Veri Modelleri)       │
│  - MongoDB şemalarını tanımlar              │
│  - Tip tanımları                            │
│  - Varlıklar arası ilişkiler                │
└─────────────────────────────────────────────┘
```

##### Katman Sorumlulukları

**Controller Katmanı:**
- HTTP isteklerini alır
- class-validator dekoratörleri ile DTO'lar kullanarak giriş doğrulaması yapar
- Uygun service metodlarını çağırır
- Uygun status kodları ile HTTP yanıtları döndürür
- Exception'ları yakalar ve hata yanıtlarını formatlar

**Service Katmanı:**
- Temel iş mantığını içerir
- İş kurallarını uygular (ör: komisyon hesaplama, aşama geçişleri)
- Gerektiğinde birden fazla repository arasında koordinasyon sağlar
- İş kısıtlamalarını doğrular
- Domain-specific exception'lar fırlatır

**Repository Katmanı:**
- MongoDB/Mongoose işlemleri üzerinde soyutlama sağlar
- Karmaşık sorguları ve aggregasyonları yönetir
- Veri kalıcılığını yönetir
- Domain modellerini (Documents) döndürür
- Service katmanını veritabanı implementasyon detaylarından habersiz tutar

**Schema Katmanı:**
- Veri yapısını ve doğrulama kurallarını tanımlar
- Koleksiyonlar arası ilişkileri kurar
- Tip güvenliği için TypeScript tipleri sağlar

##### Modül Bağımlılıkları

**AppModule** (Kök Modül)
- Tüm domain modüllerini import eder
- Global modülleri yapılandırır (ConfigModule, MongooseModule)
- MongoDB bağlantısını kurar

```
AppModule
├── ConfigModule (global)
├── MongooseModule.forRootAsync (global MongoDB bağlantısı)
├── AgentsModule
├── TransactionsModule
└── CommissionModule
```

**Modüller Arası Bağımlılıklar:**

```
TransactionsModule
├── imports: CommissionModule (komisyon hesaplama için)
├── imports: AgentsModule (agent işlemleri için)
└── providers: PdfService (paylaşılan servis)

CommissionModule
└── exports: CommissionService (TransactionsModule tarafından kullanılır)

AgentsModule
└── exports: AgentsService (TransactionsModule tarafından kullanılır)
```

##### Neden Bu Yapı?

1. **Domain-Driven Design**: Her modül net bir iş domain'i temsil eder
2. **Sorumlulukların Ayrılması**: Her katmanın tek, iyi tanımlanmış bir sorumluluğu vardır
3. **Test Edilebilirlik**: İş mantığı HTTP veya veritabanı olmadan izole edilmiş ve kolay test edilebilir
4. **Bakım Kolaylığı**: Bir katmandaki değişiklikler diğerlerine yayılmaz
5. **Ölçeklenebilirlik**: Mevcut kodu etkilemeden yeni özellikler veya modüller eklemek kolaydır
6. **Yeniden Kullanılabilirlik**: Servisler ve repository'ler farklı bağlamlarda yeniden kullanılabilir

##### Ek Paylaşılan Bileşenler

**Common Modülü** (`src/common/`)
- **Filters**: Tutarlı hata yanıtları için global exception filter
- **Interceptors**: İstek/yanıt loglama için logging interceptor

**Servisler** (`src/services/`)
- **PdfService**: PDF oluşturma için paylaşılan servis, TransactionsModule tarafından kullanılır

### 1.2 Transaction Aşama Geçiş Mantığı

##### İleriye ve Geriye Dönük Aşama Geçişleri

Sistem, gelen yeni aşamayı transaction'ın mevcut aşamasıyla karşılaştırarak stage transition'ları yönetir:

**İleriye Dönük Geçişler (Katı Validasyon):**

Sistem, gelen yeni aşamayı transaction'ın mevcut aşamasıyla karşılaştırarak ileriye dönük geçişleri doğrular:

1. **agreement aşaması**:
   - Yeni transaction'lar için: mevcut aşama `null` veya `undefined` olmalı
   - Tüm transaction'ların başladığı başlangıç aşamasıdır

2. **earnest_money aşaması**:
   - Mevcut aşama `agreement`, `null` veya `undefined` olabilir
   - Müşteri parayı hemen yatırmış olabileceği için, direkt ödeme ile başlayan transaction'lara izin verir

3. **title_deed aşaması**:
   - Mevcut aşama `earnest_money` olmalı
   - Katı validasyon: agreement'dan direkt title_deed'e geçilemez

4. **completed aşaması**:
   - Mevcut aşama `title_deed` olmalı
   - Katı validasyon: önceki tüm aşamalardan geçilmiş olmalı

**Geriye Dönük Geçişler (Validasyon Yok):**

Geriye dönük geçişlerde (mevcut aşamadan daha önceki bir aşamaya geri dönme) sistem herhangi bir validasyon uygulamaz:
- Bir transaction herhangi bir aşamadan daha önceki herhangi bir aşamaya geri dönebilir
- Bu şu durumları ele almayı sağlar:
  - Transaction bozulmuş veya iptal edilmiş olabilir
  - Aşamaların sıfırlanması gerekebilir
  - İş süreçleri daha önceki aşamalara dönüş gerektirebilir

**Neden Bu Yaklaşım:**
- **İleriye Dönük Validasyon**: Doğru aşama sırasını zorunlu kılarak iş süreci bütünlüğünü sağlar
- **Geriye Dönük Esneklik**: Hatalardan kurtulmayı ve istisnai durumları ele almayı sağlar
- **Mevcut Aşama Karşılaştırması**: Gelen yeni aşamayı transaction'ın mevcut aşamasıyla karşılaştırarak geçişin ileriye mi geriye mi olduğunu belirler
- **Esnek Başlangıç Aşaması**: Ödeme hemen yapılmışsa transaction'ların earnest_money'den başlamasına izin verir

### 1.3 Financial Breakdown ve Komisyon Hesaplama

##### Komisyon Hesaplama Akışı

Bir transaction'ın stage'i `completed` olduğunda, sistem otomatik olarak `calculateCommission` metodunu tetikler. Bu metod:

1. **Transaction Verilerini Alır**: Completed transaction'ı listing ve selling agent'larıyla birlikte getirir
2. **İş Kurallarını Uygular**: Dokümandaki kurallara göre komisyon hesaplar:
   - Toplam ücretin %50'si ajansaya gider
   - Kalan %50, senaryolara göre agent'lar arasında dağıtılır
3. **Komisyon Kaydı Oluşturur**: Hesaplanan komisyonu Commissions koleksiyonuna kaydeder
4. **Transaction History'ye Ekler**: Komisyon hesaplamasını detaylı agent bilgileriyle transaction history'ye kaydeder

##### Financial Breakdown Endpoint

Financial breakdown endpoint'i (`GET /transactions/financialBreakdown`) kapsamlı bir rapor sunar:

**Nasıl Çalışır:**
1. **Completed Transaction'ları Sorgular**: Stage = 'completed' olan tüm transaction'ları MongoDB aggregation ile bulur
2. **Commissions ile Join Yapar**: `$lookup` kullanarak transaction'ları ilgili commission kayıtlarıyla birleştirir
3. **Agents ile Join Yapar**: Komisyon verilerini agent detaylarıyla (isim, soyisim, email) zenginleştirmek için başka bir `$lookup` yapar
4. **Detaylı Rapor Döndürür**: Her transaction şunları içerir:
   - Transaction detayları (ID, name, description)
   - Komisyon dağılımı (agency amount, agent amounts)
   - Her komisyon girişi için agent bilgileri

**Neden Bu Yaklaşım:**
- **Saklanmış Veri**: Komisyonlar transaction tamamlandığında hesaplanıp saklandığı için, bunları verimli bir şekilde join edebiliriz
- **Performans**: `$lookup` ile aggregation kullanmak, anlık hesaplamadan daha verimlidir
- **Veri Bütünlüğü**: Komisyon hesaplamaları değişmezdir, tarihsel doğruluğu garanti eder
- **Detaylı Raporlama**: Agent bilgileri komisyon kayıtlarında saklanır, kapsamlı raporlar sağlar

##### PDF Oluşturma

Sistem ayrıca PDF export fonksiyonelliği de sunar:

- **Endpoint**: `GET /transactions/financialBreakdown/pdf`
- **Oluşturur**: Tüm financial breakdown verilerini içeren profesyonel formatlanmış PDF raporu
- **Kullanır**: HTML şablonlarını PDF'ye dönüştürmek için Puppeteer
- **Özellikler**:
  - Stilize tablolar ve bölümler
  - Transaction detayları
  - Komisyon dağılımları
  - Agent bilgileri

##### Alternatifleri neden reddettim

**Alternatif 1: Monolitik Modül Yapısı (Tüm şemalar tek modülde)**

**Reddedilen Yaklaşım:**
Tüm şemaları (agents, transactions, commissions) ayrım olmadan tek bir modülde tutmak.

**Neden Reddedildi:**
- **Okunabilirlik Sorunları**: Her şemanın farklı bir modülde olmadığı modüler olmayan projelerde, uygulama okunması daha zor hale gelir. Tüm controller'lar, service'ler ve repository'ler birbirine karışır ve kod tabanının yapısını anlamayı zorlaştırır.
- **Test Edilebilirlik Sorunları**: Modüler yapı olmadan, test etmek daha zorlaşır. İş mantığı sıkı bir şekilde bağlı olur ve bileşenleri izole etmeyi ve test etmeyi zorlaştırır. Her şemanın kendi adanmış modülü olmadığı için, unit test yazmak ve mocking yapmak daha karmaşık hale gelir.
- **Bakım Kolaylığı Endişeleri**: Bir domain'deki değişiklikler (ör: agents) tüm kod tabanını etkiler, bu da breaking change riskini artırır.
- **Ölçeklenebilirlik Sınırlamaları**: Yeni özellikler veya domain'ler eklemek, aynı büyük dosyaları değiştirmeyi gerektirir, bu da merge conflict'lere ve kod karmaşıklığına yol açar.

---

## 2. En Zor / Riskli Kısım

### 2.1 Hangi tasarım kararı riskliydi?

**Risk: Modüler Mimari Karmaşıklığı**

Tasarım kararı olarak modüler yapının bazı riskleri var. Bunlardan bazıları modül sayısı arttıkça kodun okunabilirliği ve şemalar arasında bağımlılıkların yönetilmesi gibi süreçlerin zorlaşmasıdır. Karmaşıklık şu durumlarda artar:
- Birden fazla modülün birbiriyle etkileşime girmesi gerektiğinde
- Şemalar arası bağımlılıkların takip edilmesi zorlaştığında
- Modül sınırları arasında kod navigasyonu zorlaştığında
- Genel sistem mimarisini anlamak için tüm modüllerin derinlemesine bilgisine ihtiyaç duyulduğunda

**Nasıl azaltıldı:**

Bunu şu şekilde çözdüm:
1. **Clean Code Yazma**: Clean code prensiplerini takip ederek her modülün, service'in ve repository'nin açık, kendi kendini açıklayan ve anlaşılması kolay kod yazılmasını sağladım.
2. **Single Responsibility Principle**: Her modülün, sınıfın ve metodun tek, iyi tanımlanmış bir sorumluluğu var. Bu, bağımlılıkları açık hale getirir ve yönetilmesini kolaylaştırır.
3. **Net Modül Sınırları**: Her modül yalnızca gerekli olanı export eder, sıkı bağlantıları önler.
4. **İyi Dokümante Edilmiş Arayüzler**: Service arayüzleri ve DTO'lar modüllerin nasıl etkileşime girdiğini açıkça tanımlar.
5. **Tutarlı İsimlendirme Kuralları**: Tutarlı isimlendirme kalıplarını takip etmek, kod tabanında gezinmeyi ve anlamayı kolaylaştırır.

**Risk Seviyesi**: Orta
- **Yanlış olursa etkisi**: Kod bakımı ve anlaşılması zorlaşır, bağımlılıklar yönetilemez hale gelir
- **Olasılık**: Düşük (clean code ve tasarım prensipleri ile azaltıldı)
- **Azaltma etkinliği**: Yüksek

---

## 3. Gerçek Hayatta Uygulansaydı — Sırada Ne Var?

### 3.1 Sıradaki özellikler veya iyileştirmeler neler olurdu?

Şu özellikler ve iyileştirmeler önceliklendirilirdi:

**1. Yetkilendirme ve Login Token Sistemi**
- JWT tabanlı kimlik doğrulama uygulanması
- Rol tabanlı erişim kontrolü (RBAC)
- Hangi kullanıcıların sistemi kullanabileceğinin belirlenmesi
- Her kullanıcı rolünün hangi işlemleri yapabileceğinin belirlenmesi
- Kullanıcı yönetim sistemi
- Güvenli API endpoint'leri

**2. Gelişmiş Loglama Sistemi (Quickwit Entegrasyonu)**
- Şu anda sistemde güzel bir log mekanizması mevcut
- Bir sonraki adım olarak logları Quickwit gibi merkezi bir sisteme taşımak
- Daha iyi log toplama, arama ve analiz imkanı
- Debug ve izleme yeteneklerinin iyileştirilmesi
- Gerçek zamanlı log içgörüleri

**3. Yapay Zeka Entegrasyonlu Gelişmiş Raporlama**
- Şu anda uygulanan: Transaction history ve financial breakdown PDF raporları
- Sonraki iyileştirmeler:
  - Daha detaylı transaction raporları
  - Transaction başarı oranlarını analiz etmek için yapay zeka entegrasyonu
  - Tahminsel analitik: Hangi transaction'lar daha başarılı olabilir?
  - İş kararları için veriye dayalı içgörüler
  - Transaction sonuç tahmini için makine öğrenmesi modelleri

**4. Redis Cache Katmanı**
- Sık erişilen verileri cache'lemek için Redis uygulanması
- MongoDB Atlas sorgularını azaltmak
- Veritabanı maliyetlerini düşürmek
- Yanıt sürelerini iyileştirmek
- Veri tutarlılığı için cache invalidation stratejileri


