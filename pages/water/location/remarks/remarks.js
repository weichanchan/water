// pages/water/location/remarks/remarks.js
Page({
  data: {
    showRemarksBox: false,
    remarks: '',
    max: 200, //最多字数
    currentWordNumber: 0,
  
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    var remarks = wx.getStorageSync('remarks') || '';
    var initLen = parseInt(this.data.remarks.length);
    this.setData({
      currentWordNumber: initLen,
      remarks: remarks
    })
  },
  goodChioceRemarks() {
    wx.navigateBack({
      delta: 1
    })
  },
  inputs: function (e) {
    var remarks = e.detail.value;
    var len = parseInt(remarks.length);

    if (len > this.data.max) return;
    this.setData({
      remarks: remarks,
      currentWordNumber: len //当前字数    
    });
    wx.setStorage({
      key: 'remarks',
      data: remarks
    })
  },
})