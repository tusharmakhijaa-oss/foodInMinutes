from django.shortcuts import render, redirect
from .forms import userForm
from .models import User, UserProfile
from django.contrib import messages
from vendor.forms import VendorForm
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .utils import detect_user_role
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.exceptions import PermissionDenied


#Restrict the vendor from acessing customer page
def check_role_vendor(user):
    if user.role == 1:
        return True
    else:
        raise PermissionDenied

#Restrict the customer from acessing vendor page
def check_role_customer(user):
    if user.role == 2:
        return True
    else:
        raise PermissionDenied


def registerUser(request):
    if request.user.is_authenticated:
        messages.info(request, 'You are already logged in.')
        return redirect('dashboard')
    elif request.method == 'POST':
        form = userForm(request.POST)
        if form.is_valid():
            #create user using form
            # user = form.save(commit=False)
            # user.set_password(form.cleaned_data['password'])
            # user.role = User.CUSTOMER
            # user.save()

            #create user using create_user method
            user = User.objects.create_user(
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
                
            )
            user.role=User.CUSTOMER
            user.save()
            messages.success(request, 'User registered successfully.')
            return redirect('registerUser')
        else:
            print("Invalid form submission")
            print(form.errors)
    else:
        form = userForm()
    context = {
        'form': form
    }
    return render(request, 'accounts/registerUser.html', context)

def registerVendor(request):
    if request.method == 'POST':
        form = userForm(request.POST)
        v_form = VendorForm(request.POST, request.FILES)
        if form.is_valid() and v_form.is_valid():
            #create user using create_user method
            user = User.objects.create_user(
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
                
            )
            user.role=User.VENDOR
            user.save()
            vendor = v_form.save(commit=False)
            vendor.user = user
            user_profile = UserProfile.objects.get(user=user)
            vendor.user_profile = user_profile
            vendor.save()
            messages.success(request, 'Vendor registered successfully.')
            return redirect('registerVendor')
        else:
            print("Invalid form submission")
            print(form.errors)
            print(v_form.errors)
    else:
        form = userForm()
        v_form = VendorForm()

    context = {
        'form': form,
        'v_form': v_form,
    }
    return render(request, 'accounts/registerVendor.html', context)

def login(request):
    if request.user.is_authenticated:
        messages.info(request, 'You are already logged in.')
        return redirect('myAccount')
    elif request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            auth_login(request, user)
            messages.success(request, 'You are now logged in.')
            return redirect('myAccount')
        else:
            messages.error(request, 'Invalid login credentials.')
            return redirect('login')
    return render(request, 'accounts/login.html')

def logout(request):
    auth_logout(request)
    messages.info(request, 'You are now logged out.')
    return redirect('login')

@login_required(login_url='login')
def myAccount(request):
    user = request.user
    redirect_url = detect_user_role(user)
    return redirect(redirect_url)

@login_required(login_url='login')
@user_passes_test(check_role_customer)
def customerDashboard(request):
    return render(request, 'accounts/customerDashboard.html')

@login_required(login_url='login')
@user_passes_test(check_role_vendor)
def vendorDashboard(request):
    return render(request, 'accounts/vendorDashboard.html')