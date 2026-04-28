import { Question } from "../../services/types";

Component({
  properties: {
    question: {
      type: Object,
      value: {} as Question,
      observer: function (newVal) {
        if (newVal && newVal.id) {
          this.initOptions();
        }
      },
    },
    userAnswer: {
      type: null, // string | string[]
      value: null,
      observer: function () {
        this.updateOptionStatus();
      },
    },
    showFeedback: {
      type: Boolean,
      value: false,
    },
    isFavorite: {
      type: Boolean,
      value: false,
    },
    hasNote: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    displayOptions: [] as any[],
    typeLabel: "",
  },

  methods: {
    initOptions() {
      const { question } = this.properties;
      const typeLabels = {
        single: "单选题",
        multiple: "多选题",
        true_false: "判断题",
      };

      const options = (question.options || []).map((opt: any) => ({
        ...opt,
        status: "", // '', 'selected', 'correct', 'wrong'
      }));

      this.setData({
        displayOptions: options,
        typeLabel: typeLabels[question.questionType as keyof typeof typeLabels] || "题目",
      });

      this.updateOptionStatus();
    },

    updateOptionStatus() {
      const { question, userAnswer, showFeedback } = this.properties;
      const { displayOptions } = this.data;

      if (!displayOptions.length) return;

      const updatedOptions = displayOptions.map((opt) => {
        let status = "";
        const isSelected = Array.isArray(userAnswer) 
          ? userAnswer.includes(opt.label) 
          : userAnswer === opt.label;

        if (showFeedback) {
          const isCorrect = Array.isArray(question.correctAnswer)
            ? question.correctAnswer.includes(opt.label)
            : question.correctAnswer === opt.label;

          if (isCorrect) {
            status = "correct";
          } else if (isSelected) {
            status = "wrong";
          }
        } else if (isSelected) {
          status = "selected";
        }

        return { ...opt, status };
      });

      this.setData({ displayOptions: updatedOptions });
    },

    onOptionTap(e: any) {
      if (this.properties.showFeedback) return;

      const { label } = e.currentTarget.dataset;
      this.triggerEvent("select", { label });
    },

    onToggleFavorite() {
      this.triggerEvent("favorite", { 
        id: this.properties.question.id,
        isFavorite: this.properties.isFavorite 
      });
    },

    onNoteTap() {
      this.triggerEvent("note", { 
        id: this.properties.question.id 
      });
    },
  },
});
