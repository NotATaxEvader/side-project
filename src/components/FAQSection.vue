<script setup>
import { ref } from "vue";

const openItem = ref(0);
const faqs = [
  {
    question: "Are these real airline tickets?",
    answer: "No. This remains an educational booking application. Flight records now come from the connected backend, but it is not connected to real airline ticketing systems.",
  },
  {
    question: "Do I need an account to search?",
    answer: "No. Anyone can search and compare flights. A backend account is required when you continue to booking.",
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, when the backend permits cancellation. The backend is responsible for updating the booking and restoring any affected seat inventory.",
  },
  {
    question: "How does payment work?",
    answer: "Payment remains a placeholder until a payment service is integrated. The backend determines and stores the final booking payment status.",
  },
];
</script>

<template>
  <section class="section-block" aria-labelledby="faq-title">
    <div class="section-heading section-heading--split">
      <div>
        <span class="eyebrow">Common questions</span>
        <h2 id="faq-title">Before you take off</h2>
      </div>
      <p>How account, booking, and payment responsibilities are handled.</p>
    </div>
    <div class="faq-list">
      <article v-for="(item, index) in faqs" :key="item.question" class="faq-item">
        <button type="button" :aria-expanded="openItem === index" @click="openItem = openItem === index ? -1 : index">
          <span>{{ item.question }}</span>
          <i :class="openItem === index ? 'bi bi-dash' : 'bi bi-plus'"></i>
        </button>
        <Transition name="accordion">
          <p v-if="openItem === index">{{ item.answer }}</p>
        </Transition>
      </article>
    </div>
  </section>
</template>
