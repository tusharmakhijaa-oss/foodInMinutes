from django.shortcuts import render, redirect
from .forms import userForm
from .models import User
from django.contrib import messages

# Create your views here.
def registerUser(request):
    if request.method == 'POST':
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