import { startPracticeSession, submitAnswer, finishPracticeSession } from "../../services/practice";
import { getQuestion, toggleFavorite, getFavoriteStatus, getNote, upsertNote } from "../../services/questions";
import { Question } from "../../services/types";

Page({
  data: {
    sessionId: "",
    questionIds: [] as string[],
    questions: {} as Record<number, Question>,
    answers: {} as Record<number, any>,
    showFeedbacks: {} as Record<number, boolean>,
    favorites: {} as Record<string, boolean>,
    notes: {} as Record<string, string>,
    currentIndex: 0,
    totalQuestions: 0,
    showSheet: false,
    loading: true,
    showNoteModal: false,
    editingNoteContent: "",
    editingQuestionId: "",
  },

  async onLoad(options: any) {
    const { bankId, sectionId, mode } = options;
    if (!bankId) {
      wx.showToast({ title: "参数错误", icon: "none" });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    await this.initSession(bankId, sectionId, mode);
  },

  async initSession(bankId: string, sectionId?: string, mode?: string) {
    try {
      const res = await startPracticeSession(bankId, sectionId);
      
      let questionIds = res.questionIds;
      if (mode === 'random') {
        questionIds = [...questionIds].sort(() => Math.random() - 0.5);
      }

      this.setData({
        sessionId: res.sessionId,
        questionIds,
        totalQuestions: questionIds.length,
        loading: false,
      });

      // Load first question
      await this.loadQuestion(0);
      // Pre-fetch next question
      this.loadQuestion(1);
    } catch (error) {
      console.error("Failed to init practice session:", error);
      wx.showToast({ title: "初始化失败", icon: "none" });
    }
  },

  async loadQuestion(index: number) {
    const { questionIds, questions } = this.data;
    if (index < 0 || index >= questionIds.length || questions[index]) return;

    const questionId = questionIds[index];
    try {
      const [question, favStatus, noteStatus] = await Promise.all([
        getQuestion(questionId),
        getFavoriteStatus(questionId),
        getNote(questionId),
      ]);

      this.setData({
        [`questions.${index}`]: question,
        [`favorites.${questionId}`]: favStatus.isFavorite,
        [`notes.${questionId}`]: noteStatus.note,
      });
    } catch (error) {
      console.error(`Failed to load question ${index}:`, error);
    }
  },

  onSwiperChange(e: any) {
    const index = e.detail.current;
    this.setData({ currentIndex: index });
    this.loadQuestion(index);
    this.loadQuestion(index + 1); // Pre-fetch next
    this.loadQuestion(index - 1); // Pre-fetch prev
  },

  async onOptionSelect(e: any) {
    const { label } = e.detail;
    const { currentIndex, sessionId, questionIds, answers, showFeedbacks } = this.data;
    
    if (showFeedbacks[currentIndex]) return; // Already answered

    const questionId = questionIds[currentIndex];
    
    // Optimistic update
    this.setData({
      [`answers.${currentIndex}`]: label,
      [`showFeedbacks.${currentIndex}`]: true,
    });

    try {
      await submitAnswer(sessionId, questionId, label);
      
      // Auto-next logic for single choice
      // In a real app, this might check user settings
      const question = this.data.questions[currentIndex];
      if (question.questionType === 'single') {
        setTimeout(() => {
          if (this.data.currentIndex === currentIndex) {
            this.onNext();
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  },

  onPrev() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
  },

  onNext() {
    if (this.data.currentIndex < this.data.totalQuestions - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
  },

  onToggleSheet() {
    this.setData({ showSheet: !this.data.showSheet });
  },

  onJump(e: any) {
    const { index } = e.detail;
    this.setData({ currentIndex: index });
  },

  async onToggleFavorite(e: any) {
    const { id } = e.detail;
    try {
      const res = await toggleFavorite(id);
      this.setData({
        [`favorites.${id}`]: res.isFavorite,
      });
      wx.showToast({
        title: res.isFavorite ? "已收藏" : "取消收藏",
        icon: "none",
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  },

  onOpenNote(e: any) {
    const { id } = e.detail;
    this.setData({
      showNoteModal: true,
      editingQuestionId: id,
      editingNoteContent: this.data.notes[id] || "",
    });
  },

  onCloseNote() {
    this.setData({
      showNoteModal: false,
      editingQuestionId: "",
      editingNoteContent: "",
    });
  },

  onNoteInput(e: any) {
    this.setData({
      editingNoteContent: e.detail.value,
    });
  },

  async onSaveNote() {
    const { editingQuestionId, editingNoteContent } = this.data;
    try {
      await upsertNote(editingQuestionId, editingNoteContent);
      this.setData({
        [`notes.${editingQuestionId}`]: editingNoteContent,
        showNoteModal: false,
      });
      wx.showToast({ title: "保存成功", icon: "none" });
    } catch (error) {
      console.error("Failed to save note:", error);
      wx.showToast({ title: "保存失败", icon: "none" });
    }
  },

  async onFinish() {
    const { sessionId, totalQuestions, answers } = this.data;
    const answeredCount = Object.keys(answers).length;

    const proceed = async () => {
      try {
        await finishPracticeSession(sessionId);
        wx.redirectTo({
          url: `/pages/results/results?sessionId=${sessionId}`,
        });
      } catch (error) {
        console.error("Failed to finish session:", error);
      }
    };

    if (answeredCount < totalQuestions) {
      wx.showModal({
        title: "结束练习",
        content: `还有 ${totalQuestions - answeredCount} 题未做，确定要结束吗？`,
        success: (res) => {
          if (res.confirm) proceed();
        },
      });
    } else {
      proceed();
    }
  },
});
