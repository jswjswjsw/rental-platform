# Technology Stack & Build System

## Architecture
Full-stack web application with separate frontend and backend services using modern JavaScript technologies.

## Frontend Stack
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite (fast development and optimized builds)
- **UI Library**: Element Plus (Vue 3 component library)
- **State Management**: Pinia (Vue 3 state management)
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Styling**: CSS3 with responsive design

## Backend Stack
- **Runtime**: Node.js (>= 14.0.0)
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, express-rate-limit, bcryptjs
- **Process Management**: PM2 (production)

## Development Tools
- **Package Manager**: npm
- **Environment**: dotenv for configuration
- **Proxy**: Vite dev server proxy for API calls

## Common Commands

### Development
```bash
# Start all services (recommended)
start-all.bat

# Or start individually:
# Backend
cd houduan && npm run dev

# Frontend  
cd qianduan && npm run dev
```

### Build & Deploy
```bash
# Build frontend for production
cd qianduan && npm run build

# Deploy with PM2
npm run pm2:start

# Full deployment
deploy-final.bat
```

### Database
```bash
# Initialize database
mysql -u root -p < shujuku/init.sql

# Or use init script
init-database.bat
```

### PM2 Management
```bash
npm run pm2:start    # Start services
npm run pm2:stop     # Stop services  
npm run pm2:restart  # Restart services
npm run pm2:logs     # View logs
npm run pm2:monit    # Monitor processes
```

## Environment Configuration
Backend requires `.env` file in `houduan/` directory with database and JWT settings. Frontend uses Vite proxy for API calls during development.

## Testing & Debugging
Project includes various test scripts in root directory:
- `test-*.js` files for testing specific functionality
- `debug-*.js` files for debugging database connections and resources
- Use these scripts to verify system components before deployment

## Deployment
Production deployment uses PM2 for process management, Nginx for reverse proxy, and serves built frontend from `qianduan/dist/`.

## Code Quality Standards
- **Documentation**: Comprehensive JSDoc comments for all modules and functions
- **Error Handling**: Consistent try-catch blocks with proper error responses
- **Validation**: Joi schema validation for all API inputs
- **Security**: JWT authentication, bcrypt password hashing, CORS, Helmet
- **File Organization**: Feature-based organization with clear separation of concerns