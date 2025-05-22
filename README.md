# File Explorer Vue

Aplikasi file explorer sederhana yang dibangun dengan Vue 3, TypeScript, dan Vite. Mendukung operasi dasar seperti membuat folder, rename, copy/paste, dan delete.

## Prasyarat

- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- [Bun](https://bun.sh/) (versi terbaru)

## Setup Project

### Menggunakan NPM

```sh
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Jalankan type-check
npm run type-check

# Jalankan linter
npm run lint

# Jalankan end-to-end tests
npm run test:e2e
```

### Menggunakan Bun

```sh
# Install Bun (jika belum terinstall)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Jalankan development server
bun run dev

# Build untuk production
bun run build

# Jalankan type-check
bun run type-check

# Jalankan linter
bun run lint

# Jalankan end-to-end tests
bun run test:e2e
```

## Fitur

- 📁 Manajemen folder (create, rename, delete)
- 📋 Operasi copy dan paste
- 🌳 Tampilan tree untuk navigasi folder
- 🔄 Breadcrumb navigation
- 🌙 Mendukung dark mode
- 📱 Responsive design

## Struktur Project

```
task-infokes-vue/
├── src/                    # Source files
│   ├── components/         # Vue components
│   ├── assets/            # Static assets
│   └── App.vue            # Root component
├── cypress/               # E2E tests
├── public/               # Public static files
└── vite.config.ts        # Vite configuration
```

## IDE yang Direkomendasikan

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (dan nonaktifkan Vetur)

## Dukungan Type untuk `.vue` Imports di TS

TypeScript tidak dapat menangani informasi type untuk `.vue` imports secara default, jadi kita menggunakan `vue-tsc` untuk type checking. Di editor, kita membutuhkan [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) agar TypeScript language service mengenali type `.vue`.

## Konfigurasi

Lihat [Vite Configuration Reference](https://vitejs.dev/config/) untuk konfigurasi lebih lanjut.

## Catatan Penggunaan Bun

- Bun memiliki performa yang lebih baik dibandingkan npm untuk instalasi dependencies
- Bun mendukung semua script yang ada di package.json
- Jika menemui masalah dengan Cypress saat menggunakan Bun, gunakan npm untuk menjalankan test e2e
