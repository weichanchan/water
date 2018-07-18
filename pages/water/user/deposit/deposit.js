// pages/water/user/deposit/deposit.js
const util = require('../../../../utils/util.js')
Page({
  data: {
    myDeposit: 0,
    emptyBucketNumber:0,
    enableDepositAmount:0
  },
  onLoad: function (options) {
  },
  onShow: function () {
    var that = this;
    //读取押金金额
    var deposit = wx.getStorageSync('deposit') || 0;
    var emptyBucketValue = wx.getStorageSync('emptyBucketValue') || 1;
    var myDeposit = deposit.depositAmount;
    var enableDepositAmount = deposit.enableDepositAmount;
    var emptyBucketNumber = parseInt(myDeposit / emptyBucketValue);
    that.setData({
      myDeposit: myDeposit,
      emptyBucketNumber: emptyBucketNumber,
      enableDepositAmount: enableDepositAmount
    })
  },
  putForwardDeposit: function () {
    var that = this;
    util.requestWithToken('https://www.yunquanlai.com/client/api/user/withdraw','', function success(res) {
      wx.showToast({
        title: '申请押金提现成功，请耐心等待处理',
        icon: 'success',
        duration: 4000
      })
      var enableDepositAmount=0;
      that.setData({
        enableDepositAmount: enableDepositAmount
      })
    });
  },
})