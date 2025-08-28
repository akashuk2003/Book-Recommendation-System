from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import generics,permissions
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import BorrowedBookSerializer, ReviewSerializer, UserCreateSerializer,BookSerializer
from .models import Book,BorrowedBook, Genre, Review
from rest_framework.response import Response
from rest_framework import status

#Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer

#Book List View
class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['author__name', 'genre__name','is_available']
    
#Borrow Book View
class BorrowBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not book.is_available:
            return Response({'error': 'Book is not available.'}, status=status.HTTP_400_BAD_REQUEST)

        if BorrowedBook.objects.filter(user=request.user, book=book, return_date__isnull=True).exists():
            return Response({'error': 'You have already borrowed this book.'}, status=status.HTTP_400_BAD_REQUEST)

        BorrowedBook.objects.create(user=request.user, book=book)
        book.is_available = False
        book.read_count += 1
        book.save()
        return Response({'message': 'Book borrowed successfully.'}, status=status.HTTP_200_OK)

#Return Book View
class ReturnBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            borrowed_record = BorrowedBook.objects.get(
                user=request.user,
                book_id=pk,
                return_date__isnull=True
            )
        except BorrowedBook.DoesNotExist:
            return Response({'error': 'Borrowed record not found.'}, status=status.HTTP_404_NOT_FOUND)

        borrowed_record.return_date = timezone.now()
        borrowed_record.save()

        book = borrowed_record.book
        book.is_available = True
        book.save()
        return Response({'message': 'Book returned successfully.'}, status=status.HTTP_200_OK)
    
#List of Borrowed Books View
class BorrowedBooksView(generics.ListAPIView):
    serializer_class = BorrowedBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BorrowedBook.objects.filter(user=self.request.user, return_date__isnull=True)
    
#Recommended Books View
class BookRecommendationView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        borrowed_genres = Genre.objects.filter(books__borrows__user=user).distinct()

        if borrowed_genres.exists():
            borrowed_book_ids = BorrowedBook.objects.filter(user=user).values_list('book__id', flat=True)
            recommendations = Book.objects.filter(genre__in=borrowed_genres) \
                                    .exclude(id__in=borrowed_book_ids) \
                                    .order_by('-read_count')
        else:
            recommendations = Book.objects.filter(is_available=True).order_by('-read_count')
        return recommendations[:5]
    

#Review Views    
class ReviewListView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        book_pk = self.kwargs['pk']
        return Review.objects.filter(book_id=book_pk)

#Create Review View
class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        book_pk = self.kwargs['pk']
        book = get_object_or_404(Book, pk=book_pk)
        serializer.save(user=self.request.user, book=book)