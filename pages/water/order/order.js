// pages/water/order/order.js
const util = require('../../../utils/util.js')
const app = getApp()
Page({
  data: {
    orders: [],
    cartTotal: 0,
    carBotPad: false,
    noData: true,
    offset: 0
  },
  onLoad(options) {
  },
  onShow: function () {
    var that = this;
    that.setData({
      offset: 0
    })
    var cartTotal = wx.getStorageSync('cartTotal') || 0;
    that.setData({
      cartTotal: cartTotal
    })
    that.getOrderData({
      url:'https://www.yunquanlai.com/client/api/queryOrder?offset=0&limit=10',
      callback: function(){}
      });
    util.clearOrderComfireParameterCaching();
  },
  getOrderData({url, callback}) {
    var that = this;
    //读取订单列表
    util.requestWithToken(url, '', function success(res) {
      var orders = res.data.orderInfoList;
      var hasDeposit = that.data.hasDeposit;
      if (orders != undefined) {
        var len = orders.length;
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            orders[i].detail = JSON.parse(orders[i].detail);
            orders[i].status = util.judgeOrderStatus(orders[i].status);
            orders[i].amountTotal = util.addAccuracy(orders[i].deposit, orders[i].amount);
            if (orders[i].deposit==0) {
              orders[i].hasDeposit = true;
            }else{
              orders[i].hasDeposit = false;
            }
          }
          that.setData({
            orders: orders,
            noData: true
          })
        } else {
          that.setData({
            noData: false
          })
        }
      }
      callback();
    });
  },
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading();
    that.getOrderData({
      url: 'https://www.yunquanlai.com/client/api/queryOrder?offset=0&limit=20',
      callback: function () {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },  
  onReachBottom: function () {
    var that = this;
    wx.showLoading({
      title: '玩命加载中',
    })
    var offset = that.data.offset;
    offset = offset + 10;

    //读取订单列表
    util.requestWithToken('https://www.yunquanlai.com/client/api/queryOrder?offset=' + offset + '&limit=10', '', function success(res) {
      var orders = that.data.orders;
      var ordersLoad = res.data.orderInfoList;
      if (ordersLoad != undefined) {
        var len = ordersLoad.length;
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            ordersLoad[i].detail = JSON.parse(ordersLoad[i].detail);
            ordersLoad[i].status = util.judgeOrderStatus(ordersLoad[i].status);
            ordersLoad[i].amountTotal = util.addAccuracy(ordersLoad[i].deposit, ordersLoad[i].amount);
            if (ordersLoad[i].deposit == 0) {
              ordersLoad[i].hasDeposit = true;
            } else {
              ordersLoad[i].hasDeposit = false;
            }
            orders.push(ordersLoad[i]);
          }
          that.setData({
            orders: orders,
            offset: offset,
            noData: true
          })

        } else {
          that.setData({
            noData: false
          })
        }
      }
      wx.hideLoading();
    });
  },  
})