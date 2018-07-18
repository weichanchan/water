// pages/water/order/confirm/confirm.js
const util = require('../../../../utils/util.js')
const app = getApp()
Page({
  data: {
    goodsList: [],
    display: true,
    showRemarksBox: true,
    remarks: '',
    max: 200, //最多字数
    currentWordNumber: 0,
    showAboutDepositBox: true,
    showDepositBox: true,
    deposits: [],
    depositsKey: 0,
    deposit: 0,
    bucketNum: 0,
    ifSelectedAddress: false,
    isOrderDetails: false,
    hasIconPosition: true,
    noData: true,
    orderToken: '',
    userAddressID: 0,
    userAddress: '',
    userName: '',
    userSex: '',
    userPhone: '',
    canSentDown: true,
    locationY: 0,
    locationX: 0,
    orderId: 0,
    token: '',
    showSendTimeBox: true,
    deliveryTime: '',
    dates: [],
    date: 0,
    times: [],
    time: 0,
    value: [0, 0],
    hasDeposit: false,
    amount: 0,
    amountTotal:0
  },
  onLoad: function(option) {},
  onShow: function() {
    var that = this;
    var token = wx.getStorageSync('token') || [];
    that.setData({
      token: token
    })

    that.getOrderConfirmData('https://www.yunquanlai.com/client/api/orderConfirm');
    that.getDepositAreaData('https://www.yunquanlai.com/client/api/depositArea');
    util.createSendDate();
    util.createSendTime();

    //获取已选地址
    let addressSelect = wx.getStorageSync('addressSelect') || [];
    if (addressSelect != '') {
      var userSex = util.judgeIntToSex(addressSelect.sex);
      var userAddress = addressSelect.address + ' ' + addressSelect.addressDetail;
      that.setData({
        ifSelectedAddress: true,
        userAddressID: addressSelect.id,
        userName: addressSelect.name,
        userSex: userSex,
        userPhone: addressSelect.phone,
        userAddress: userAddress,
        locationY: addressSelect.locationY,
        locationX: addressSelect.locationX
      })
    } else {
      that.setData({
        ifSelectedAddress: false
      })
    }
    //读取押金缓存
    var depositsComfire = wx.getStorageSync('depositsComfire') || [];
    if (depositsComfire != '') {
      var depositsKey = depositsComfire.depositsKey;
      var deposit = depositsComfire.deposit;
      var bucketNum = depositsComfire.bucketNum;
      that.setData({
        depositsKey: depositsKey,
        deposit: deposit,
        bucketNum: bucketNum
      })
    }
    //下单时间
    var deliveryTime = that.data.deliveryTime;
      var dates = util.createSendDate();
      var times = util.createSendTime();
      that.setData({
        dates: dates,
        times: times
      })

      var deliveryTime = wx.getStorageSync('deliveryTime') || [];
      if (deliveryTime == '') {
        deliveryTime = '立即'
      }
      that.setData({
        deliveryTime: deliveryTime
      })
  },
  getOrderConfirmData(url) {
    var that = this;
    var orderVO = wx.getStorageSync('orderVO') || {
      "productOrderVOList": []
    };
    util.requestWithToken(url, orderVO, function success(res) {
      //console.log(res);
      var orderToken = res.data.orderToken;
      var goodsList = res.data.orderProductDetails;
      var emptyBucketValue = wx.getStorageSync('emptyBucketValue') || 1;
      var amount = res.data.amount;
      var deposit = res.data.deposit;
      var bucketNum = parseInt(deposit / emptyBucketValue);
      var hasDeposit = that.data.hasDeposit;
      if (deposit == 0) {
        hasDeposit = true;
      }
      var amountTotal = util.addAccuracy(deposit, amount);
      that.setData({
        goodsList: goodsList,
        amount: amount,
        amountTotal: amountTotal,
        orderToken: orderToken,
        deposit: deposit,
        bucketNum: bucketNum,
        hasDeposit: hasDeposit
      });
    });
  },
  getDepositAreaData(url) {
    var that = this;
    util.requestWithToken(url, '', function success(res) {
      //console.log(res);
      var deposiArea = res.data.deposiArea;

      var deposits = that.data.deposits;
      for (let k in deposiArea) {
        deposits.push({
          price: deposiArea[k],
          bucket: k
        });
      }
      that.setData({
        deposits: deposits
      })
    });
  },
  gotoPay: function() {
    var that = this;
    var deliveryTime = that.data.deliveryTime;
    var openid = wx.getStorageSync('openid');
    let addressSelect = wx.getStorageSync('addressSelect') || [];

    if (deliveryTime == '') {
      wx.showToast({
        title: '请选择配送时间',
        icon: "none",
        duration: 2000
      })
      return;
    }

    if (addressSelect == '') {
      wx.showToast({
        title: '请选择地址',
        icon: "none",
        duration: 2000
      })
      return;
    }
    that.submitOrderData('https://www.yunquanlai.com/client/api/order', openid);
    
  },
  submitOrderData(url, openid) { //提交订单
    var that = this;
    var orderVO = wx.getStorageSync('orderVO');
    var orderToken = that.data.orderToken;

    var userAddress = that.data.userAddress;
    var userName = that.data.userName;
    var userSex = that.data.userSex;
    userSex = util.judgeSexToInt(userSex);
    var userPhone = that.data.userPhone;
    var remarks = that.data.remarks;
    var deliveryTime = that.data.deliveryTime;
    var locationY = that.data.locationY;
    var locationX = that.data.locationX;
    var deposit = that.data.deposit;
    var bucketNum = that.data.bucketNum;

    var orderVODetails = {
      "deposit": deposit,
      "bucketNum": bucketNum,
      "orderToken": orderToken,
      "address": userAddress,
      "name": userName,
      "sex": userSex,
      "locationY": locationY,
      "locationX": locationX,
      "phone": userPhone,
      "remark": remarks,
      "deliveryTime": that.data.deliveryTime == "立即" ? '' : that.data.deliveryTime
    };

    orderVODetails = JSON.stringify(orderVODetails);
    var orderDetialsLen = orderVODetails.length;
    orderVODetails = orderVODetails.substr(0, orderDetialsLen - 1) + ',';
    orderVO = JSON.stringify(orderVO).substr(1);
    orderVODetails = orderVODetails + orderVO;

    //console.log(orderVODetails);

    orderVODetails = JSON.parse(orderVODetails);

    util.requestWithToken(url, orderVODetails, function(res) {
      if (res.data.code == 507) {
        var orderToken = res.data.orderToken;
        that.setData({
          orderToken: orderToken
        });
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        })
        return;
      }

      if (res.data.code == 506) {
        wx.navigateBack({
          delta: 1,
          success: function (res) {
            wx.showToast({
              title: '订单确认超时，请重新下单',
              icon: 'none',
              duration: 2000
            })
          }
        })
        return;
      }

      var orderId = res.data.orderInfo.id;
      //boss说不管有没有全选，下单成功就清空购物车缓存
      var cartItems = [];
      var cartTotal = 0;
      var cartItemsChoice = [];

      wx.setStorage({
        key: 'cartItems',
        data: cartItems
      })
      wx.setStorage({
        key: 'cartTotal',
        data: cartTotal
      })
      wx.setStorage({
        key: 'cartItemsChoice',
        data: cartItemsChoice
      })
      wx.setStorage({
        key: 'cartTotalChoice',
        data: cartTotal
      })
      util.clearOrderComfireParameterCaching();
      util.wxPay('https://www.yunquanlai.com/client/api/wechat/pay/wxPay?openid=' + openid + '&orderId=' + orderId);
      that.setData({
        orderId: orderId
      })
    });
  },
  //打开备注弹窗 
  showRemarksBox: function() {
    var initLen = parseInt(this.data.remarks.length);
    var state = util.modifyPopupBoxState(this.data.showRemarksBox)
    this.setData({
      showRemarksBox: state,
      currentWordNumber: initLen
    })
  },
  closeRemarksBox: function() {
    var state = util.modifyPopupBoxState(this.data.showRemarksBox)
    this.setData({
      showRemarksBox: state
    })
  },
  bindTextAreaBlur: function(e) {
    this.setData({
      remarks: e.detail.value
    })
  },
  formSubmit: function(e) {
    var remarks = this.data.remarks;
    this.setData({
      remarks: remarks
    })
    this.closeRemarksBox()
    wx.setStorage({
      key: 'remarks',
      data: remarks
    })
  },
  inputs: function(e) {
    var value = e.detail.value;
    var len = parseInt(value.length);

    if (len > this.data.max) return;
    this.setData({
      currentWordNumber: len //当前字数    
    });
  },
  //打开押金弹窗 
  showDepositBox: function() {
    var state = util.modifyPopupBoxState(this.data.showDepositBox)
    this.setData({
      showDepositBox: state
    })
  },
  closeDepositBox: function() {
    var state = util.modifyPopupBoxState(this.data.showDepositBox)
    this.setData({
      showDepositBox: state
    })
  },
  changDepositsColor(e) {
    var depositsKey = e.currentTarget.dataset.index;
    var deposits = this.data.deposits;
    var deposit = deposits[depositsKey].price;
    var bucketNum = deposits[depositsKey].bucket;

    this.setData({
      depositsKey: depositsKey,
      deposit: deposit,
      bucketNum: bucketNum
    })
    var depositsComfire = {
      depositsKey: depositsKey,
      deposit: deposit,
      bucketNum: bucketNum
    }
    wx.setStorage({
      key: 'depositsComfire',
      data: depositsComfire
    })
    this.closeDepositBox();

  },
  //打开关于押金弹窗 
  showAboutDepositBox: function() {
    var state = util.modifyPopupBoxState(this.data.showAboutDepositBox)
    this.setData({
      showAboutDepositBox: state
    })
  },
  closeAboutDepositBox: function() {
    var state = util.modifyPopupBoxState(this.data.showAboutDepositBox)
    this.setData({
      showAboutDepositBox: state
    })
  },
  nowPayDeposit: function() {
    this.closeAboutDepositBox();
  },
  //打开配送时间弹窗 
  showSendTimeBox: function() {
    var that = this;
    var state = util.modifyPopupBoxState(that.data.showSendTimeBox)
    that.setData({
      showSendTimeBox: state
    })
    const val = that.data.value;
    that.initSendTime(val);
  },
  closeSendTimeBox: function() {
    var that = this;
    var state = util.modifyPopupBoxState(that.data.showSendTimeBox)
    that.setData({
      showSendTimeBox: state
    })
  },
  bindSendTimeChange: function(e) {
    const val = e.detail.value;
    this.initSendTime(val);
  }, 
  confirmDoneDate(){
    this.closeSendTimeBox();
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
  //是否开发票，暂时不需要
  invoiceSwitchChange: function(e) {
    if (e.detail.value == true) {
      this.setData({
        display: false
      })
    } else {
      this.setData({
        display: true
      })
    }
  }

})