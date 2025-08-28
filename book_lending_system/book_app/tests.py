from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Book, Author, Genre

class BookAPITests(APITestCase):
    
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username='testuser', password='password123')
        
        author = Author.objects.create(name='Test Author')
        genre = Genre.objects.create(name='Fiction')
        Book.objects.create(title='Book 1', author=author, genre=genre)
        Book.objects.create(title='Book 2', author=author, genre=genre)

    def test_list_books_authenticated(self):
        response = self.client.post('/api/login/', {'username': 'testuser', 'password': 'password123'}, format='json')
        token = response.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/books/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        self.assertEqual(response.data['results'][0]['title'], 'Book 1')

    def test_list_books_unauthenticated(self):
        response = self.client.get('/api/books/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)