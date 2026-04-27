<b>SPL-2</b>
# 🚀 AcademiX – Academic Management System

## 📌 Project Overview
AcademiX is a full-stack web-based academic management system developed as part of the Software Project Lab (SPL-2).  
The system digitizes academic, financial, and administrative processes at IIT, University of Dhaka.

It integrates students, teachers, staff, and admin operations into a single platform, reducing manual work and improving efficiency and transparency.

---

## 🎯 Objectives
- Automate academic workflows  
- Reduce manual errors and paperwork  
- Provide centralized system management  
- Ensure secure role-based access  
- Improve transparency in payments and approvals  

---

## 🧱 System Architecture
This project follows a 3-tier architecture:

Frontend → User Interface (React)  
Backend → Business Logic & API (Node.js + Express)  
Database → Data Storage (MySQL)  

Flow:  
User → Frontend → Backend → Database → Response → User  

---

## 🛠️ Tech Stack

Frontend: React, HTML, CSS  
Backend: Node.js, Express  
Database: MySQL  
Authentication: JWT  
Tools: Git, GitHub, Postman  

---

## ⚙️ Key Features

### 🔐 Authentication
- Login & Registration  
- JWT-based authentication  
- Password hashing (bcrypt)  

### 🧑‍🎓 Student Features
- View dashboard  
- Pay semester fees  
- Apply for testimonial  
- Apply for ECA certificate  
- Submit budget requests  

### 👨‍🏫 Teacher Features
- Manage student activities  
- Approve/reject budgets  
- Review ECA applications  

### 🛡️ Admin Features
- User & Role Management  
- Notice Management  
- Payment Management  
- Testimonial Approval  
- Budget Control  
- Certificate Generation  

---

## 🔄 Workflow

1. User registers and logs in  
2. System verifies user  
3. Role-based dashboard is assigned  
4. User performs actions  
5. Admin monitors system  

---

## 📂 Project Structure
AcademiX/
│
├── frontend/        # React frontend
├── backend/         # Node.js backend
├── database/        # SQL scripts
├── README.md
