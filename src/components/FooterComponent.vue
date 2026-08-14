<template>
  <footer class="site-footer">
    <div class="container-xl footer-grid">
      <div>
        <RouterLink class="brand brand--footer" :to="{ name: 'home' }">
          <span class="brand-mark"><i class="bi bi-arrow-up-right"></i></span>
          <span>Altitude</span>
        </RouterLink>
        <p class="footer-copy">A clear, uncomplicated way to search and manage flight bookings.</p>
      </div>
      <div class="footer-links">
        <RouterLink :to="{ name: 'flights' }">Browse flights</RouterLink>
        <RouterLink :to="{ name: 'my-bookings' }">Manage bookings</RouterLink>
        <a href="mailto:support@altitude.test">Support</a>
      </div>
      <div class="footer-meta">
        <span>Educational project</span>
        <span>© 2026 Altitude</span>
      </div>
    </div>
  </footer>
</template>
