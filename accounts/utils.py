from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.conf import settings



def detect_user_role(user):
    if user.role == 1:
        redirect_url = 'vendorDashboard'
        return redirect_url
    elif user.role == 2:
        redirect_url = 'customerDashboard'
        return redirect_url
    elif user.role is None and user.is_superuser:
        redirect_url = '/admin'
        return redirect_url


def send_verification_email(request, user, mail_subject, email_template):
    from_email = settings.DEFAULT_FROM_EMAIL
    current_site = get_current_site(request)
    message = render_to_string(email_template,{
        'user': user,
        'domain': current_site,
        'uid' : urlsafe_base64_encode(force_bytes(user.pk)),
        'token' :  default_token_generator.make_token(user)
    })
    to_email = user.email
    mail = EmailMessage(mail_subject, message, from_email, to=[to_email])
    mail.send()


# def send_password_reset_email(request, user):
#     from_email = settings.DEFAULT_FROM_EMAIL
#     current_site = get_current_site(request)
#     mail_subject = 'Reset password Link for foodinminutes'
#     message = render_to_string('accounts/emails/reset_password_email.html',{
#         'user': user,
#         'domain': current_site,
#         'uid' : urlsafe_base64_encode(force_bytes(user.pk)),
#         'token' :  default_token_generator.make_token(user)
#     })
#     to_email = user.email
#     mail = EmailMessage(mail_subject, message, from_email, to=[to_email])
#     mail.send()
