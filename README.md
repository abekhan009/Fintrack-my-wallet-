# FinTrack - Personal Finance Manager

A modern, responsive web application for managing personal finances and tuition center operations. Built with React, featuring a beautiful glass morphism design and comprehensive financial tracking capabilities.

![FinTrack Logo](public/favicon.svg)

## ✨ Features

### Personal Finance Management
- 💰 **Multi-Wallet System** - Manage multiple wallets with different currencies
- 📊 **Transaction Tracking** - Record income, expenses, and transfers
- 🔄 **Recurring Expenses** - Set up and manage recurring payments
- 📈 **Financial Reports** - Visual insights into spending patterns
- 🎯 **Budget Categories** - Organize transactions by custom categories

### Tuition Center Management
- 👨‍🎓 **Student Management** - Complete student profiles and records
- 💳 **Fee Collection** - Track tuition payments and outstanding fees
- 📋 **Payment History** - Detailed payment records and receipts
- 📊 **Analytics Dashboard** - Revenue insights and collection trends
- 🔗 **Integrated Finances** - Connect tuition income to personal wallets

### User Experience
- 🎨 **Modern UI** - Glass morphism design with smooth animations
- 📱 **Responsive Design** - Works perfectly on all devices
- 🌙 **Dark Theme** - Easy on the eyes with beautiful gradients
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development
- 🔐 **Secure Authentication** - JWT-based authentication system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abekhan009/Fintrack-my-wallet-.git
   cd Fintrack-my-wallet-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button/         # Custom button component
│   ├── Card/           # Card layouts
│   ├── Header/         # Navigation header
│   ├── Logo/           # SVG logo component
│   └── Sidebar/        # Navigation sidebar
├── context/            # React context providers
│   ├── AuthContext.jsx # Authentication state
│   └── DataContext.jsx # Application data state
├── hooks/              # Custom React hooks
├── layouts/            # Page layout components
├── pages/              # Page components
│   ├── Home/           # Dashboard
│   ├── Transactions/   # Transaction management
│   ├── Wallets/        # Wallet management
│   ├── Recurring/      # Recurring expenses
│   └── tuition/        # Tuition center pages
├── services/           # API services
│   └── api.js          # API client configuration
└── styles/             # Global styles and variables
```

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (#8b5cf6 → #6366f1)
- **Secondary**: Blue to green gradient (#6366f1 → #10b981)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Components
- **Glass Morphism**: Backdrop blur with subtle borders
- **Smooth Animations**: CSS transitions and keyframes
- **Responsive Grid**: Mobile-first design approach

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# Optional: Custom branding
VITE_APP_NAME=FinTrack
VITE_APP_DESCRIPTION=Personal Finance Manager
```

### API Integration

The frontend communicates with a REST API backend. Key endpoints:

- `POST /auth/login` - User authentication
- `GET /wallets` - Fetch user wallets
- `GET /transactions` - Fetch transactions
- `POST /transactions` - Create new transaction
- `GET /tuition/students` - Fetch students (tuition mode)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔐 Security Features

- JWT token-based authentication
- Automatic token refresh
- Secure session management
- Input validation and sanitization
- CORS protection

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production-ready files.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist/` folder to Netlify

### Environment Variables for Production

Set these in your hosting platform:

```env
VITE_API_URL=https://your-api-domain.com/api/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Google Fonts** - Typography
- **Heroicons** - Icon system

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/abekhan009/Fintrack-my-wallet-/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 🗺️ Roadmap

- [ ] Dark/Light theme toggle
- [ ] Export data to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with banking APIs

---

**Made with ❤️ by [abekhan009](https://github.com/abekhan009)**