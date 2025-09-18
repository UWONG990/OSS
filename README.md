# OSS - Online Shopping System

A monorepo containing a complete online shopping system built with Laravel, React, and PostgreSQL.

## Architecture

This project follows a monorepo structure:

```
├── backend/          # Laravel API backend
├── frontend/         # React frontend application
├── docker/           # Docker configuration files
├── docker-compose.yml # Main Docker Compose configuration
└── README.md         # This file
```

## Technologies Used

- **Backend**: Laravel 10.x with PHP 8.2
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Authentication**: Laravel Sanctum
- **API**: RESTful API with JSON responses

## Features

- User authentication and authorization
- Product catalog management
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OSS
```

2. Start the application:
```bash
docker-compose up -d
```

3. Install backend dependencies:
```bash
docker-compose exec backend composer install
```

4. Set up the database:
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```

5. Install frontend dependencies:
```bash
docker-compose exec frontend npm install
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: [localhost:8080](http://localhost:8080)

### Default Admin Credentials

- Email: admin@oss.com
- Password: password

## Development

### Backend Development

The backend is a Laravel application located in the `backend/` directory.

```bash
# Run migrations
docker-compose exec backend php artisan migrate

# Create a new migration
docker-compose exec backend php artisan make:migration create_products_table

# Run seeders
docker-compose exec backend php artisan db:seed

# Access Laravel Tinker
docker-compose exec backend php artisan tinker
```

### Frontend Development

The frontend is a React application located in the `frontend/` directory.

```bash
# Install new packages
docker-compose exec frontend npm install <package-name>

# Run tests
docker-compose exec frontend npm test

# Build for production
docker-compose exec frontend npm run build
```

### Database Management

PostgreSQL is configured with:
- Database: `oss_database`
- Username: `oss_user`
- Password: `oss_password`

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U oss_user -d oss_database
```

## API Documentation

The API follows RESTful conventions. Key endpoints:

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove item from cart

### Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details

## Testing

```bash
# Backend tests
docker-compose exec backend php artisan test

# Frontend tests
docker-compose exec frontend npm test
```

## Deployment

For production deployment, update the environment variables in `docker-compose.prod.yml` and use:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
