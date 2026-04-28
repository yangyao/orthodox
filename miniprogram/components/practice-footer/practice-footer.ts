Component({
  properties: {
    currentIndex: {
      type: Number,
      value: 0,
    },
    total: {
      type: Number,
      value: 0,
    },
  },

  methods: {
    onPrev() {
      this.triggerEvent("prev");
    },
    onNext() {
      this.triggerEvent("next");
    },
    onToggleSheet() {
      this.triggerEvent("togglesheet");
    },
    onFinish() {
      this.triggerEvent("finish");
    },
  },
});
