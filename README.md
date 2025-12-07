# Iceberg - Real Estate Transaction and Commission Management System

A comprehensive NestJS-based API for managing real estate transactions, agents, and commission calculations.

## 🌐 Live API

**Base URL**: https://iceberg-production-af7d.up.railway.app/

**Swagger Documentation**: https://iceberg-production-af7d.up.railway.app/api

The API is connected to MongoDB Atlas and uses the connection string from the environment variables.

---

## Features

- 🏢 **Agent Management**: Create and manage real estate agents
- 💼 **Transaction Management**: Handle real estate transactions with multiple stages
- 💰 **Commission Calculation**: Automatic commission calculation based on business rules
- 📊 **Financial Reports**: Generate financial breakdown reports with PDF export
- 📝 **Transaction History**: Track all changes and events in transaction lifecycle
- 📚 **API Documentation**: Full Swagger/OpenAPI documentation

---

## 🚀 Quick Start / Hızlı Başlangıç

### English

**Step 1: Install Dependencies**
```bash
npm install
```

**Step 2: Configure Environment**
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL=your_mongodb_atlas_connection_string
```

**Note**: The application connects to MongoDB Atlas using the `DATABASE_URL` from your environment variables. You can use the same connection string format as MongoDB Atlas provides.

**Step 3: Start the Application**
```bash
npm run start:dev
```

**Step 4: Access Swagger Documentation**
Open your browser and navigate to:
```
http://localhost:3000/api
```

**Step 5: Import Postman Collection**
- **Location**: `postman/collections/Iceberg.postman_collection.json`
- Import this file into Postman for pre-configured API endpoints

---

### Türkçe

**Adım 1: Bağımlılıkları Yükleyin**
```bash
npm install
```

**Adım 2: Ortam Değişkenlerini Yapılandırın**
Proje kök dizininde `.env` dosyası oluşturun:
```env
PORT=3000
DATABASE_URL=mongodb_atlas_bağlantı_string_iniz
```

**Not**: Uygulama, ortam değişkenlerindeki `DATABASE_URL` kullanarak MongoDB Atlas'a bağlanır. MongoDB Atlas'ın sağladığı bağlantı string formatını kullanabilirsiniz.

**Adım 3: Uygulamayı Başlatın**
```bash
npm run start:dev
```

**Adım 4: Swagger Dokümantasyonuna Erişin**
Tarayıcınızda şu adresi açın:
```
http://localhost:3000/api
```

**Adım 5: Postman Collection'ı İçe Aktarın**
- **Konum**: `postman/collections/Iceberg.postman_collection.json`
- Bu dosyayı Postman'e import ederek hazır API endpoint'lerini kullanabilirsiniz

---

## 📚 API Documentation

**Local Swagger UI**: `http://localhost:3000/api`

**Live Swagger UI**: https://iceberg-production-af7d.up.railway.app/api

Features:
- Interactive API testing
- Request/Response schemas
- Example payloads

## 📦 Postman Collection

**Location**: `postman/collections/Iceberg.postman_collection.json`

Import this file into Postman to test all endpoints with pre-configured requests.

---

## 📝 Available Scripts

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Build
npm run build

# Lint
npm run lint

# Test
npm run test
```
