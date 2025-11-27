// Modal Component
Vue.component("app-modal", {
  template: `
    <div :class="['modal', { show: show }]" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <span class="close" @click="close">&times;</span>
          <h2>{{ title }}</h2>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">Batal</button>
          <button class="btn btn-danger" @click="confirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Konfirmasi",
    },
    confirmText: {
      type: String,
      default: "Ya",
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
});
