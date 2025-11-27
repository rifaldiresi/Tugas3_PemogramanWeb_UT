// Status Badge Component
Vue.component("status-badge", {
  template: `
    <div class="tooltip">
      <span :class="['status-badge', statusClass]">
        {{ statusIcon }} {{ statusText }}
      </span>
      <span class="tooltiptext" v-html="catatan"></span>
    </div>
  `,
  props: {
    qty: {
      type: Number,
      required: true,
    },
    safety: {
      type: Number,
      required: true,
    },
    catatan: {
      type: String,
      default: "",
    },
  },
  computed: {
    statusClass() {
      if (this.qty === 0) return "status-kosong";
      if (this.qty < this.safety) return "status-menipis";
      return "status-aman";
    },
    statusText() {
      if (this.qty === 0) return "Kosong";
      if (this.qty < this.safety) return "Menipis";
      return "Aman";
    },
    statusIcon() {
      if (this.qty === 0) return "🔴";
      if (this.qty < this.safety) return "⚠️";
      return "✅";
    },
  },
});
