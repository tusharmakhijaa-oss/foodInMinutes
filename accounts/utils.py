

def detect_user_role(user):
    if user.role == 1:
        redirect_url = 'vendorDashboard'
        return redirect_url
    elif user.role == 2:
        redirect_url = 'customerDashboard'
        return redirect_url
    elif user.role is None and user.is_superadmin:
        redirect_url = '/admin'
        return redirect_url