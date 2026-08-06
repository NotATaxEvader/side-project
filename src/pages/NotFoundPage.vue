<template>
  <div class="not-found-page">
    <div class="not-found-visual" aria-hidden="true">
      <span>4</span><i class="bi bi-airplane"></i><span>4</span>
    </div>
    <span class="eyebrow">Page not found</span>
    <h1>This route doesn’t exist.</h1>
    <p>The page may have moved, or the address may be incorrect.</p>
    <div>
      <RouterLink class="btn btn-dark" :to="{ name: 'home' }">Back to home</RouterLink>
      <RouterLink class="btn btn-outline-dark" :to="{ name: 'flights' }">Browse flights</RouterLink>
    </div>
  </div>
</template>
