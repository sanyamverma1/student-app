document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const errorEl = document.getElementById('error');
  const submitBtn = document.getElementById('submitBtn');
  const roleNote = document.getElementById('roleNote');

  const updateRoleNote = () => {
    const role = form.role?.value || 'user';
    if (roleNote) roleNote.innerHTML = `Signing in as <strong>${role === 'admin' ? 'Admin' : 'User'}</strong>.`;
  };
  Array.from(form.role || []).forEach(r => r.addEventListener('change', updateRoleNote));
  updateRoleNote();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (errorEl) errorEl.textContent = '';
    if (submitBtn) submitBtn.disabled = true;

    const payload = {
      username: form.username?.value.trim() || '',
      password: form.password?.value || '',
      role: form.role?.value || 'user'
    };

    if (!payload.username || !payload.password) {
      if (errorEl) errorEl.textContent = 'Username and password are required.';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.json().catch(()=>({message:'Login failed'}));
        if (errorEl) errorEl.textContent = body?.message || 'Invalid credentials.';
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      const data = await res.json();
      if (data.token) localStorage.setItem('authToken', data.token);
      const dest = (payload.role === 'admin') ? '/admin/dashboard' : '/user/dashboard';
      window.location.href = data.redirect || dest;
    } catch (err) {
      if (errorEl) errorEl.textContent = 'Network error. Try again.';
      if (submitBtn) submitBtn.disabled = false;
      console.error(err);
    }
  });
});