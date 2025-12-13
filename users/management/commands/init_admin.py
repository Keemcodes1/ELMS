from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Creates a superuser efficiently'

    def handle(self, *args, **options):
        User = get_user_model()
        username = 'admin_live'
        email = 'admin@example.com'
        password = 'Password123!'

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser "{username}"'))
        else:
            # Optional: Reset password to ensure valid login
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.WARNING(f'Superuser "{username}" already exists. Password reset.'))
