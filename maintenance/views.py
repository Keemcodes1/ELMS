from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from .models import Complaint, ComplaintImage
from .serializers import (
    ComplaintSerializer,
    ComplaintListSerializer,
    ComplaintCreateSerializer,
    ComplaintImageSerializer
)


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing complaints
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ComplaintListSerializer
        elif self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see complaints for their properties
        if user.is_landlord:
            return Complaint.objects.filter(unit__building__owner=user)
        # Caretakers see assigned complaints
        elif user.is_caretaker:
            return Complaint.objects.filter(assigned_to=user)
        # Admins see all complaints
        elif user.is_staff:
            return Complaint.objects.all()
        # Tenants see their own complaints
        elif user.is_tenant:
            return Complaint.objects.filter(tenant__user=user)
        return Complaint.objects.none()
    
    @action(detail=False, methods=['get'])
    def submitted(self, request):
        """Get all submitted complaints"""
        complaints = self.get_queryset().filter(status='SUBMITTED')
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Get all in-progress complaints"""
        complaints = self.get_queryset().filter(status='IN_PROGRESS')
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def resolved(self, request):
        """Get all resolved complaints"""
        complaints = self.get_queryset().filter(status='RESOLVED')
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get all urgent complaints"""
        complaints = self.get_queryset().filter(priority='URGENT')
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign complaint to a user"""
        complaint = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        
        if not assigned_to_id:
            return Response(
                {'error': 'assigned_to user ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            assigned_user = User.objects.get(id=assigned_to_id)
            complaint.assigned_to = assigned_user
            if complaint.status == 'SUBMITTED':
                complaint.status = 'IN_PROGRESS'
                complaint.started_at = timezone.now()
            complaint.save()
            return Response({'message': 'Complaint assigned successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark complaint as resolved"""
        complaint = self.get_object()
        complaint.status = 'RESOLVED'
        complaint.resolved_at = timezone.now()
        complaint.resolution_notes = request.data.get('resolution_notes', '')
        complaint.actual_cost = request.data.get('actual_cost')
        complaint.save()
        return Response({'message': 'Complaint marked as resolved'})
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close complaint"""
        complaint = self.get_object()
        complaint.status = 'CLOSED'
        complaint.closed_at = timezone.now()
        complaint.save()
        return Response({'message': 'Complaint closed'})
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get complaint statistics"""
        queryset = self.get_queryset()
        return Response({
            'total': queryset.count(),
            'submitted': queryset.filter(status='SUBMITTED').count(),
            'in_progress': queryset.filter(status='IN_PROGRESS').count(),
            'resolved': queryset.filter(status='RESOLVED').count(),
            'closed': queryset.filter(status='CLOSED').count(),
            'urgent': queryset.filter(priority='URGENT').count(),
        })


class ComplaintImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing complaint images
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see images for their property complaints
        if user.is_landlord:
            return ComplaintImage.objects.filter(complaint__unit__building__owner=user)
        # Admins see all images
        elif user.is_staff:
            return ComplaintImage.objects.all()
        # Tenants see their own complaint images
        elif user.is_tenant:
            return ComplaintImage.objects.filter(complaint__tenant__user=user)
        return ComplaintImage.objects.none()
