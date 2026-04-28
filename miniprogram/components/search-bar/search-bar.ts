Component({
  properties: {
    placeholder: {
      type: String,
      value: "搜索题库",
    },
    value: {
      type: String,
      value: "",
    },
  },
  methods: {
    onInput(e: any) {
      const value = e.detail.value;
      this.setData({ value });
      this.triggerEvent("input", { value });
    },
    onSearch() {
      this.triggerEvent("search", { value: this.data.value });
    },
    onClear() {
      this.setData({ value: "" });
      this.triggerEvent("input", { value: "" });
      this.triggerEvent("search", { value: "" });
    },
  },
});
