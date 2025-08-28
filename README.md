# Book Lending & Recommendation System

The project is a full-stack application featuring a Django REST API backend and a React frontend. It provides a platform for users to browse, borrow, and return books, and receive personalized book recommendations based on their borrowing history.

Live Site : https://book-recommendation-system-4fynnwul7-akashuk2003s-projects.vercel.app/

## Features

* **User Authentication:** Secure JWT-based user registration and login.
* **Book Browsing:** List all books with filters for genre, author, and availability.
* **Lend & Return:** Users can borrow available books and return them.
* **Personal Library:** Users can view a list of all the books they are currently borrowing.
* **Recommendation Engine:** Recommends books based on the user's borrowing history (same genre). For new users, it suggests globally popular books (Top 5 Results).
* **Book Reviews:** Users can add a 1-5 star rating and a comment for books.
* **API Documentation:** API documentation available via Swagger API.
* **Pagination:** All book lists are paginated for efficient data handling.

## Tech Stack

* **Backend:** Django, Django REST Framework, djangorestframework-simplejwt
* **Frontend:** React.js, Tailwind CSS
* **Database:** SQLite3 for development, PostgreSQL for Production

## Setup & Installation

### Backend Setup (Django)

First, set up the Django server.

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd book_lending_system  # Navigate to the backend directory
   ```

2. Create and activate a virtual environment

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages

   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations

   ```bash
   python manage.py migrate
   ```

5. Start the Django development server

   ```bash
   python manage.py runserver
   ```

The backend API will now be running at `http://127.0.0.1:8000`.

### Frontend Setup (React)

In a separate terminal, set up the React client.

1. Navigate to the frontend directory

   ```bash
   cd book_lending_frontend
   ```

2. Install npm packages

   ```bash
   npm install
   ```

3. Start the React development server

   ```bash
   npm run dev
   ```

The frontend application will now be running at `http://localhost:3000`.

## API Endpoints

The API endpoints are listed below. All protected routes require a Bearer token in the Authorization header.

* **POST** `/api/register/` → Register a new user.
* **POST** `/api/login/` → Obtain JWT access and refresh tokens.
* **GET** `/api/books/` → Get a paginated list of all books.
* **POST** `/api/books/<id>/borrow/` → Borrow a specific book.
* **POST** `/api/books/<id>/return/` → Return a borrowed book.
* **GET** `/api/my-borrowed-books/` → List books currently borrowed by the user.
* **GET** `/api/recommendations/` → Get book recommendations for the user.
* **GET** `/api/books/<id>/reviews/` → Get all reviews for a specific book.
* **POST** `/api/books/<id>/reviews/create/` → Add a new review for a book.

## API Documentation

API documentation is available via Swagger UI at:
`http://127.0.0.1:8000/api/schema/swagger-ui/`

## Submission Files

* **Postman Collection:** A `postman_collection.json` file is included in the root of the project with sample requests for all API endpoints.
* **Deployment:** The application is deployed at Render for the backend and Vercel for the frontend.

note :books,authors,genres added from admin panel in local and supabase in production.
