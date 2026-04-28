Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    total: {
      type: Number,
      value: 0,
    },
    currentIndex: {
      type: Number,
      value: 0,
    },
    answers: {
      type: Object, // Record<number, any>
      value: {},
    },
  },

  methods: {
    onClose() {
      this.triggerEvent("close");
    },
    onItemTap(e: any) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent("jump", { index });
      this.onClose();
    },
    onFinish() {
      this.triggerEvent("finish");
      this.onClose();
    },
  },
});
