// pages/water/user/index/index.js
const util = require('../../../../utils/util.js')
const app = getApp()
Page({
  data: {
    isLogin: false,
    carBotPad: false,
    username: '',
    avatarUrl: '',
    cartTotal: 0,
    addressNum: '',
    myDeposit: ''
  },
  onLoad: function(options) {
  },
  onShow: function() {
    var that = this;
    var token = wx.getStorageSync('token') || [];
    var username = wx.getStorageSync('username') || [];
    var avatarUrl = wx.getStorageSync('avatarUrl') || [];

    if (token != '') { //已登录
      that.setData({
        isLogin: true,
        username: username,
        avatarUrl: avatarUrl
      })
    } else {
      that.setData({
        isLogin: false
      })
    }

    //购物车数量
    var cartTotal = wx.getStorageSync('cartTotal') || 0;
    that.setData({
      cartTotal: cartTotal
    })
    //读取押金金额
    that.getMyDeposit('https://www.yunquanlai.com/client/api/user/info');
    //收货地址个数
    that.getAddressData('https://www.yunquanlai.com/client/api/getAddress');

    util.clearOrderComfireParameterCaching();
  },
  gotoLogin() {
    if (token != '') { //已登录
      return;
    } 
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  getAddressData: function(url) {
    var that = this;
    util.requestWithToken(url, '', function (res) {
      var address = res.data.userAddressEntityList;
      if (address != undefined && address != '') {
        var addressNum = '';
        if (address != '') {
          var addressNum = '已设置' + address.length + '个';
        }
        that.setData({
          addressNum: addressNum
        })
      }
    });
  }, 
  getMyDeposit: function (url) {
    var that = this;
    var emptyBucketValue = wx.getStorageSync('emptyBucketValue') || [];
    util.requestWithToken(url, '', function (res) {
      //console.log(res)
      var userInfo = res.data.userInfo;
      if (userInfo != undefined) {
        var depositAmount = userInfo.depositAmount;
        var disableDepositAmount = userInfo.disableDepositAmount;
        var emptyBucketNumber = parseInt(depositAmount / emptyBucketValue);
        var enableDepositAmount = userInfo.enableDepositAmount;
        var deposit = {
          depositAmount: depositAmount,
          disableDepositAmount: disableDepositAmount,
          emptyBucketNumber: emptyBucketNumber,
          enableDepositAmount: enableDepositAmount
        };

        that.setData({
          myDeposit: depositAmount
        })
        wx.setStorage({
          key: "deposit",
          data: deposit,
        })
        }
    });
  },
})