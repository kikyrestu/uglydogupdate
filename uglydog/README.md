# 🐶 UglyDog Web App

Welcome to **UglyDog**, a decentralized web application combining Web3, Laravel backend, and a React frontend.  
This repository contains the fullstack source code powering UglyDog — an experimental platform built with blockchain integration in mind.

---

## 📦 Tech Stack

- **Backend**: Laravel 12 + Laravel Shield (role-permission system)
- **Frontend**: ReactJS (Vite)
- **Authentication & RBAC**: Laravel Shield
- **Web3 Integration**: Handled by our Web3 Developer (👋 hi, I'm the Web3 dev!)

---

## 🚀 Getting Started

Clone the repository and follow the steps below to get both backend and frontend up and running:

---

### 🔧 Backend Setup (Laravel)

```bash
# Clone repo
git clone https://github.com/lexaiko/uglydog.git

# Masuk ke folder backend
cd uglydog/backend

# Install PHP dependencies
composer install

# Install frontend dependencies (for Laravel Vite assets)
npm install

# Copy .env
cp .env.example .env

# Configure ur database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ur_database
DB_USERNAME=root
DB_PASSWORD=

# Run key generate
php artisan key:generate

# Run fresh migration and seed database
php artisan migrate:fresh --seed

# Generate all Shield (role & permission) configs
php artisan shield:generate --all

# Assign super-admin role to specific user (choose user ID 11)
php artisan shield:super-admin

# Run development build for Laravel assets
npm run dev

# Serve Laravel app
php artisan serve
```
---

### Frontend
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```
---
