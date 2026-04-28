import { getQuestionDetail } from '../../services/questions';
import { submitAnswer, finishPracticeSession } from '../../services/practice';
import { Question } from '../../services/types';

Page({
  data: {
    sessionId: '',
    questionIds: [] as string[],
    currentIndex: 0,
    questions: {} as Record<string, Question>,
    userAnswers: {} as Record<string, any>,
    showSheet: false,
    
    // Timer
    remainingSeconds: 0,
    timerDisplay: '00:00:00',
    startTime: 0,
    durationMinutes: 0,
  },

  timerId: null as any,

  onLoad(options: any) {
    const { id, qids, duration } = options;
    const questionIds = qids.split(',');
    
    this.setData({
      sessionId: id,
      questionIds,
      durationMinutes: parseInt(duration),
      remainingSeconds: parseInt(duration) * 60,
      startTime: Date.now()
    });

    this.startTimer();
    this.fetchQuestion(0);
    this.fetchQuestion(1); // Pre-fetch next

    // Enable exit warning
    if (wx.enableAlertBeforeUnload) {
      wx.enableAlertBeforeUnload({
        message: '考试正在进行中，退出将无法保存当前进度，确定退出吗？'
      });
    }
  },

  onUnload() {
    this.stopTimer();
  },

  onShow() {
    // Re-sync timer in case app was in background
    if (this.data.startTime) {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000);
      const remaining = Math.max(0, this.data.durationMinutes * 60 - elapsed);
      this.setData({ remainingSeconds: remaining });
      this.updateTimerDisplay();
    }
  },

  startTimer() {
    this.updateTimerDisplay();
    this.timerId = setInterval(() => {
      if (this.data.remainingSeconds > 0) {
        this.setData({
          remainingSeconds: this.data.remainingSeconds - 1
        });
        this.updateTimerDisplay();
      } else {
        this.stopTimer();
        this.onTimeUp();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  updateTimerDisplay() {
    const s = this.data.remainingSeconds;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    
    const display = [h, m, rs].map(v => v.toString().padStart(2, '0')).join(':');
    this.setData({ timerDisplay: display });
  },

  onTimeUp() {
    wx.showModal({
      title: '考试时间到',
      content: '考试时间已结束，系统将自动提交您的试卷。',
      showCancel: false,
      success: () => {
        this.onFinish(true);
      }
    });
  },

  async fetchQuestion(index: number) {
    const id = this.data.questionIds[index];
    if (!id || this.data.questions[id]) return;

    try {
      const question = await getQuestionDetail(id);
      this.setData({
        [`questions.${id}`]: question
      });
    } catch (err) {
      console.error('Failed to fetch question:', err);
    }
  },

  onSwiperChange(e: any) {
    const index = e.detail.current;
    this.setData({ currentIndex: index });
    this.fetchQuestion(index);
    this.fetchQuestion(index + 1);
    this.fetchQuestion(index - 1);
  },

  async onAnswerSelect(e: any) {
    const { questionId, answer } = e.detail;
    this.setData({
      [`userAnswers.${questionId}`]: answer
    });

    try {
      // In mock mode, we still call submit but don't show result
      await submitAnswer(this.data.sessionId, questionId, answer);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  },

  onPrev() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
  },

  onNext() {
    if (this.data.currentIndex < this.data.questionIds.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
  },

  toggleSheet() {
    this.setData({ showSheet: !this.data.showSheet });
  },

  goToQuestion(e: any) {
    this.setData({ 
      currentIndex: e.detail.index,
      showSheet: false 
    });
  },

  onFinish(auto = false) {
    if (!auto) {
      const answered = Object.keys(this.data.userAnswers).length;
      const total = this.data.questionIds.length;
      
      wx.showModal({
        title: '交卷确认',
        content: `您已回答 ${answered}/${total} 题，确定要交卷吗？`,
        success: async (res) => {
          if (res.confirm) {
            this.doFinish();
          }
        }
      });
    } else {
      this.doFinish();
    }
  },

  async doFinish() {
    wx.showLoading({ title: '正在交卷' });
    try {
      const res = await finishPracticeSession(this.data.sessionId);
      wx.hideLoading();
      
      // Disable alert before navigating
      if (wx.disableAlertBeforeUnload) {
        wx.disableAlertBeforeUnload();
      }

      wx.redirectTo({
        url: `/pages/results/index?id=${res.id}&mode=mock`
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  onBack() {
    wx.showModal({
      title: '确认退出',
      content: '退出后当前进度将无法保存，确定要退出考试吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
