from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer, 
    UserSerializer, 
    UserListSerializer,
    PasswordChangeSerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (admin/landlord only)
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords can see their tenants and caretakers
        if user.is_landlord:
            return User.objects.filter(role__in=['TENANT', 'CARETAKER'])
        # Admins can see everyone
        elif user.is_staff:
            return User.objects.all()
        # Others can only see themselves
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password for current user"""
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Wrong password.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password updated successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def tenants(self, request):
        """Get all tenants"""
        tenants = User.objects.filter(role='TENANT')
        serializer = UserListSerializer(tenants, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def landlords(self, request):
        """Get all landlords"""
        landlords = User.objects.filter(role='LANDLORD')
        serializer = UserListSerializer(landlords, many=True)
        return Response(serializer.data)
