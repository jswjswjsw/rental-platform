# Project Structure & Organization

## Root Directory Layout
```
├── qianduan/           # Frontend Vue 3 application
├── houduan/            # Backend Express.js API
├── shujuku/            # Database scripts and schemas
├── ziyuan/             # Resources/assets directory
├── node_modules/       # Root-level dependencies
├── *.bat               # Windows batch scripts for deployment/management
├── *.js                # Utility and server scripts
├── *.sql               # Database initialization scripts
└── *.md                # Documentation files
```

## Frontend Structure (qianduan/)
```
qianduan/
├── src/
│   ├── components/     # Reusable Vue components
│   │   ├── auth/       # Authentication components (LoginForm, RegisterForm)
│   │   ├── layout/     # Layout components (AppHeader, AppFooter)
│   │   ├── resource/   # Resource-related components (ResourceCard)
│   │   └── rental/     # Rental components (RentalForm)
│   ├── views/          # Page-level components/routes
│   ├── stores/         # Pinia state management stores
│   ├── utils/          # Utility functions (api.js, index.js)
│   ├── router/         # Vue Router configuration
│   ├── App.vue         # Root component
│   ├── main.js         # Application entry point
│   └── style.css       # Global styles
├── public/             # Static assets
├── dist/               # Build output (generated)
├── index.html          # HTML template
├── package.json        # Frontend dependencies
└── vite.config.js      # Vite build configuration
```

## Backend Structure (houduan/)
```
houduan/
├── config/
│   └── database.js     # Database connection configuration
├── middleware/
│   ├── auth.js         # JWT authentication middleware
│   └── upload.js       # File upload middleware (Multer)
├── routes/             # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── users.js        # User management endpoints
│   ├── categories.js   # Category management endpoints
│   ├── resources.js    # Resource management endpoints
│   ├── orders.js       # Order management endpoints
│   ├── reviews.js      # Review system endpoints
│   ├── favorites.js    # Favorites functionality
│   └── init.js         # Database initialization endpoints
├── uploads/            # File upload storage
│   ├── avatars/        # User avatar images
│   └── resources/      # Resource images
├── app.js              # Main Express application
├── index.js            # Application entry point
├── package.json        # Backend dependencies
├── template.yml        # Deployment template
└── .env                # Environment variables (not in git)
```

## Database Structure (shujuku/)
```
shujuku/
├── init.sql            # Complete database initialization
├── add-favorites-table.sql  # Favorites table addition
└── *.sql               # Additional schema modifications
```

## Key Conventions

### File Naming
- **Frontend**: kebab-case for files, PascalCase for Vue components
- **Backend**: camelCase for JavaScript files
- **Database**: snake_case for table and column names

### Directory Organization
- **Components**: Organized by feature/domain (auth, layout, resource, rental)
- **Routes**: One file per major entity/feature
- **Uploads**: Separated by type (avatars, resources)

### API Structure
- RESTful endpoints following `/api/{entity}` pattern
- Authentication required endpoints use JWT middleware
- File uploads handled through dedicated middleware

### Configuration Files
- **Frontend**: `vite.config.js` for build configuration
- **Backend**: `.env` for environment variables
- **Database**: `config/database.js` for connection settings
- **Deployment**: `ecosystem.config.js` for PM2 configuration

### Static Assets
- **Development**: Served through Vite dev server with proxy
- **Production**: Frontend assets in `dist/`, uploads served by Express
- **Images**: Stored in `houduan/uploads/` with organized subdirectories

## Code Style Conventions

### Documentation Standards
- **JSDoc Comments**: All modules, functions, and classes must have comprehensive JSDoc documentation
- **Bilingual Documentation**: File headers and major functions documented in Chinese for business context, with English for technical details
- **Function Headers**: Include purpose (功能说明), parameters, return values, and examples
- **Code Comments**: Business logic comments in Chinese, technical implementation in English

### Error Handling Patterns
- **Backend**: Consistent try-catch with standardized error responses
- **Frontend**: Axios interceptors for global error handling with Element Plus messages
- **Validation**: Joi schemas for backend validation, form validation on frontend

### API Design Patterns
- **RESTful Structure**: `/api/{entity}` pattern with standard HTTP methods
- **Response Format**: Consistent JSON structure with `success`, `message`, `data` fields
- **Authentication**: JWT middleware for protected routes
- **File Uploads**: Multer middleware with organized storage structure