//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    motto: '请登录',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../water/index/index'
    })
  },
  onLoad: function() {
    var token = wx.getStorageSync('token') || [];
    if (token != '') {
      this.setData({
        hasUserInfo: true
      })
    }
  },
  onShow() {

  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo

    if (app.globalData.userInfo == undefined) { //拒绝授权
      wx.switchTab({
        url: '/pages/water/index/index'
      })
    } else { //允许授权
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        motto: '授权成功',
      });

      //请求token
      var openid = wx.getStorageSync('openid') || [];
      var unionid = wx.getStorageSync('unionid') || [];
      var username = app.globalData.userInfo.nickName;
      var avatarUrl = app.globalData.userInfo.avatarUrl;

      //console.log(openid);
      //console.log(unionid);
      //console.log(username);

      wx.setStorage({
        key: "username",
        data: username,
      })
      wx.setStorage({
        key: "avatarUrl",
        data: avatarUrl,
      })
      //获取token
      util.loadToken(function (){
        wx.switchTab({
          url: '/pages/water/user/index/index'
        })
      });
      
    }
  }
})