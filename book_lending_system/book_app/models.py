from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Author(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
    
class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Book(models.Model):
    title=models.CharField(max_length=200)
    author=models.ForeignKey(Author, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, related_name='books')
    is_available=models.BooleanField(default=True)
    read_count=models.IntegerField(default=0)
    
    def __str__(self):
        return self.title
    
class BorrowedBook(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrows')
    borrowed_at=models.DateTimeField(auto_now_add=True)
    return_date=models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together=('user','book','return_date')
    
    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}"
    
    
class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"Review for {self.book.title} by {self.user.username}"
    
