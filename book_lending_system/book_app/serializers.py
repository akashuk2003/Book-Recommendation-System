from .models import Author, Genre, Book, BorrowedBook, Review
from django.contrib.auth.models import User
from rest_framework import serializers

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class BookSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    genre = serializers.StringRelatedField()

    class Meta:
        model = Book
        fields = '__all__'
        

class BorrowedBookSerializer(serializers.ModelSerializer):
    book = BookSerializer()
    
    class Meta:
        model = BorrowedBook
        fields = ('book', 'borrowed_at')
        
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'rating', 'comment', 'created_at')