"""
URL configuration for book_lending_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import BookListView, BookRecommendationView, BorrowBookView, BorrowedBooksView, RegisterView, ReturnBookView, ReviewCreateView, ReviewListView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    #Registration endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    #Book endpoints
    path('books/', BookListView.as_view(), name='book-list'),
    path('books/<int:pk>/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('books/<int:pk>/return/', ReturnBookView.as_view(), name='return-book'),
    path('my-borrowed-books/', BorrowedBooksView.as_view(), name='my-borrowed-books'),
    path('recommendations/', BookRecommendationView.as_view(), name='book-recommendations'),
    
    #ratings and reviews endpoints
    path('books/<int:pk>/reviews/', ReviewListView.as_view(), name='review-list'),
    path('books/<int:pk>/reviews/create/', ReviewCreateView.as_view(), name='review-create'),
]

