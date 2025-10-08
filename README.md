# Resonira - Modern AI & Technology Solutions Website

A modern, professional, and fully responsive website for Resonira, showcasing AI development, software solutions, and technology consulting services.

## 🚀 Features

- **Modern Design**: Minimal, futuristic, and professional look with dark/light theme toggle
- **Responsive**: Fully responsive design for all devices (mobile, tablet, desktop)
- **Animations**: Smooth animations and transitions using Framer Motion
- **Theme Support**: Dark and light theme with gradient accents (blue + violet tones)
- **Glassmorphism**: Subtle glassmorphism effects and smooth hover animations
- **SEO Optimized**: SEO-friendly meta tags and structured content
- **Form Validation**: Contact form with comprehensive validation
- **Interactive Components**: Animated counters, FAQ accordion, and interactive elements

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Context API** - Theme management

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Button.js       # Custom button component
│   ├── Card.js         # Card component with variants
│   ├── Navbar.js       # Navigation component
│   └── Footer.js       # Footer component
├── contexts/           # React contexts
│   └── ThemeContext.js # Theme management
├── pages/              # Page components
│   ├── Home.js         # Home page
│   ├── Services.js     # Services page
│   ├── About.js        # About page
│   ├── Portfolio.js    # Portfolio page
│   └── Contact.js      # Contact page
├── App.js              # Main app component
├── index.js            # App entry point
└── index.css           # Global styles
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Blue tones (#3b82f6 to #1e40af)
- **Secondary**: Purple tones (#a855f7 to #581c87)
- **Accent**: Cyan tones (#0ea5e9 to #0c4a6e)
- **Gradients**: Blue to violet combinations

### Components
- **Glassmorphism**: Subtle glass effects with backdrop blur
- **Hover Effects**: Scale and rotation animations
- **Loading States**: Custom loading animations
- **Form Validation**: Real-time validation with error states

## 📱 Pages & Sections

### Home Page
- Hero section with animated background
- Services overview with feature cards
- Company statistics with animated counters
- Client testimonials
- Call-to-action sections

### Services Page
- Detailed service descriptions
- Technology stack showcase
- Development process timeline
- Service categories with filtering

### About Page
- Company mission and vision
- Team member profiles
- Company values
- Timeline of milestones
- Statistics and achievements

### Portfolio Page
- Project showcase with filtering
- Case studies with results
- Technology tags
- Interactive project cards

### Contact Page
- Contact form with validation
- Contact information cards
- FAQ section
- Success/error states

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resonira-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🎯 Key Features Implementation

### Theme System
- Context-based theme management
- Local storage persistence
- System preference detection
- Smooth theme transitions

### Animations
- Page transitions with Framer Motion
- Scroll-triggered animations
- Hover effects and micro-interactions
- Loading states and feedback

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Responsive typography
- Touch-friendly interactions

### Form Handling
- Real-time validation
- Error state management
- Success feedback
- Accessibility features

## 🔧 Customization

### Colors
Update the color scheme in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Your primary colors
  },
  secondary: {
    // Your secondary colors
  }
}
```

### Content
- Update company information in page components
- Replace placeholder images with actual content
- Modify service descriptions and team information
- Update contact information

### Styling
- Customize animations in component files
- Modify glassmorphism effects in `index.css`
- Update gradient combinations
- Adjust spacing and typography

## 📈 Performance

- Optimized bundle size
- Lazy loading for images
- Efficient animations
- Minimal re-renders
- SEO-friendly structure

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please contact:
- Email: hello@resonira.com
- Phone: +1 (555) 123-4567

---

Built with ❤️ by the Resonira team
