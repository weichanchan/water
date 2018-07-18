// pages/water/location/choiceDate/choiceDate.js
const util = require('../../../../utils/util.js')
Page({
  data: {
    showSendTimeBox: false,
    dates: [],
    date: 0,
    times: [],
    time: 0,
    value: [0, 0],
    cartTotal: 0,
    deliveryTime: '选择时间',
    addressSelect: ''
  },
  onLoad: function (options) {
  },
  onShow: function () {
    var that = this;
    var deliveryTime = wx.getStorageSync('deliveryTime') || [];
    var dates = util.createSendDate();
    var times = util.createSendTime();
    that.setData({
      dates: dates,
      times: times
    })
    
    const val = that.data.value;
    that.initSendTime(val);
  }, 
  goodChioce() {
    wx.navigateBack({
      delta: 1
    })
  },
  bindSendTimeChange: function (e) {
    const val = e.detail.value;
    this.initSendTime(val);
  },
  initSendTime(val) {
    var that = this;
    var date = that.data.dates[val[0]];
    var time = that.data.times[val[1]];
    var deliveryTime = date + ' ' + time;
    that.setData({
      deliveryTime: deliveryTime
    })
    wx.setStorage({
      key: 'deliveryTime',
      data: deliveryTime
    })
  },
})