import { QuestionBank } from "../../services/types";

Component({
  properties: {
    bank: {
      type: Object,
      value: {} as QuestionBank,
    },
  },
  methods: {
    onTap() {
      this.triggerEvent("click", this.properties.bank);
    },
  },
});
