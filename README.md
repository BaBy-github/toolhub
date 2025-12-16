# ToolHub

A powerful and modern tool hub built with Vue 3, TypeScript, and Vite, designed to provide a collection of useful developer tools in one place.

## 🚀 Features

- **Modern UI**: Clean and responsive design built with Tailwind CSS
- **Code Editor**: Integrated Monaco Editor for code editing and preview
- **Internationalization**: Support for multiple languages with i18next
- **JSON Tools**: JSON viewer and formatter
- **TypeScript Support**: Full TypeScript integration for type safety
- **Fast Development**: Hot module replacement with Vite
- **Beautiful Icons**: Remix Icon library for rich visual elements

## 🛠️ Tech Stack

- **Framework**: Vue 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Icons**: Remix Icon
- **Internationalization**: i18next
- **Code Editor**: Monaco Editor
- **Formatting**: Prettier

## 📦 Quick Start

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`

### Installation

```sh
# Clone the repository
# (This is a local project, so cloning is not necessary if you already have the files)

# Install dependencies
npm install
```

### Development

```sh
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```sh
# Type check and build for production
npm run build

# Preview the production build
npm run preview
```

### Code Quality

```sh
# Format code with Prettier
npm run format

# Run TypeScript type check
npm run type-check
```

## 📁 Project Structure

```
src/
├── components/        # Vue components
├── composables/       # Vue composition functions
├── data/              # Data files
├── i18n/              # Internationalization configuration
├── pages/             # Page components
├── router/            # Vue Router configuration
├── utils/             # Utility functions
├── App.vue            # Root component
├── main.ts            # Application entry point
└── style.css          # Global styles
```

## 🎨 Components

- **Code Editor**: Monaco Editor integration for code editing
- **JSON Tree View**: Interactive JSON viewer and formatter
- **Typewriter Effect**: Animated text typing effect
- **Responsive Layout**: Mobile-first design with Tailwind CSS

## 🌍 Internationalization

ToolHub supports multiple languages through i18next. Language files are located in the `src/i18n/` directory.

## 🛠️ Development Guidelines

### Recommended IDE Setup

- **VS Code** with:
  - [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Browser Setup

- **Chromium-based browsers** (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - Enable [Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- **Firefox**:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - Enable [Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Changelog

See the [CHANGELOG](CHANGELOG.md) file for details.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Vite](https://vite.dev/) - Next generation frontend tooling
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor from VS Code
- [i18next](https://www.i18next.com/) - Internationalization framework
- [Remix Icon](https://remixicon.com/) - Open source icon library

## 📞 Contact

For any questions or suggestions, please open an issue or contact the project maintainers.

---

Built with ❤️ using Vue 3 + TypeScript + Vite
