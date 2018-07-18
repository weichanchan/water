// pages/water/order/details/details.js
const util = require('../../../../utils/util.js')
Page({
  data: {
    goodsList: [],
    amountTotal: 0,
    amount:0,
    deliveryTime: '',
    creationTime: '',
    deposit: 0,
    bucketNum: 0,
    hasDeposit:false,
    remark: '',
    name: '',
    address: '',
    sex: '',
    phone: '',
    status:'',
    senderId:0,
    senderSite: '',
    senderName: '',
    senderPhone: '',
    senderHead: null,
    noData: true,
    showAboutDepositBox: true,
    gotoEvaluate:false,
    ifEvaluated: false,
    gotoPay:false,
    orderId:0,
    isOrderDetails:true
  },
  onLoad(option){
    var that = this;
    var orderId = option.id;
that.setData({
  orderId: orderId
})
  },
  onShow() {
    var that = this;
    var orderId = that.data.orderId;
    that.getOrderDetailsData('https://www.yunquanlai.com/client/api/queryOrderDetail?orderId=' + orderId);
  },
  gotoPay: function () {
    var that = this;
    var orderId = that.data.orderId;
    var openid = wx.getStorageSync('openid');
    util.wxPay('https://www.yunquanlai.com/client/api/wechat/pay/wxPay?openid=' + openid + '&orderId=' + orderId);
  },
  getOrderDetailsData(url) {
    var that = this;
    //读取订单列表
    util.requestWithToken(url, '', function success(res) {
      var orderDeliveryInfo = res.data.orderDeliveryInfo;
      var deliveryDistributor = res.data.deliveryDistributor || [];//配送员
      var orderInfo = res.data.orderInfo;
      var goodsList = JSON.parse(orderInfo.detail);
      var sex = util.judgeIntToSex(orderDeliveryInfo.sex);
      var status = orderInfo.status;
      var ifEvaluated = that.data.ifEvaluated;
      var gotoEvaluate = that.data.gotoEvaluate;
      var gotoPay = that.data.gotoPay;
      //判断是否已评价
      if (status == 60) { //已评价
        ifEvaluated = true
      } else {
        ifEvaluated = false
      }
      if (status == 40) {//已送达
        gotoEvaluate = true
      } else {
        gotoEvaluate = false
      }
      if (status == 10) {//待支付
        gotoPay = true
      } else {
        gotoPay = false
      }

      status = util.judgeOrderStatus(status);
      var deposit = orderInfo.deposit;
      var hasDeposit = that.data.hasDeposit;
      if (deposit == 0) {
        hasDeposit = true;
      }
      var bucketNum = orderInfo.bucketNum;
      var amount = orderInfo.amount;
      var amountTotal = util.addAccuracy(deposit, amount);
      var senderId = that.data.senderId;
      var senderSite = that.data.senderSite;
      var senderName = that.data.senderName;
      var senderPhone = that.data.senderPhone;
      var senderHead = that.data.senderHead;

      if (deliveryDistributor != null || deliveryDistributor != '') {
        senderId = deliveryDistributor.id;
        senderName = deliveryDistributor.name;
        senderPhone = deliveryDistributor.phone;
        senderSite = deliveryDistributor.deliveryEndpointName;
        senderHead = deliveryDistributor.healthUrl;
      }
      var deliveryTime = orderDeliveryInfo.deliveryTime;

      if (deliveryTime==null){
        deliveryTime='立即'
      }

      that.setData({
        goodsList: goodsList,
        deliveryTime: deliveryTime,
        creationTime: orderDeliveryInfo.creationTime,
        status: status,
        remark: orderDeliveryInfo.remark,
        name: orderDeliveryInfo.name,
        address: orderDeliveryInfo.address,
        sex: sex,
        deposit: deposit,
        bucketNum: bucketNum,
        hasDeposit: hasDeposit,
        phone: orderDeliveryInfo.phone,
        amountTotal: amountTotal,
        amount: orderInfo.amount,
        senderId: senderId,
        senderSite: senderSite,
        senderName: senderName,
        senderPhone: senderPhone,
        senderSite: senderSite,
        senderName: senderName,
        senderPhone: senderPhone,
        senderHead: senderHead,
        gotoEvaluate: gotoEvaluate,
        ifEvaluated: ifEvaluated,
        gotoPay: gotoPay,
      })
    });

  },
  gotoEvaluate() {
    var that = this;
    var orderId = that.data.orderId;
    var senderId = that.data.senderId;
    var senderName = that.data.senderName;
    var senderPhone = that.data.senderPhone;
    var senderHead = that.data.senderHead;
    var goodsList = that.data.goodsList;
    var len = goodsList.length;
    var productId = [];
    for(let i=0;i<len;i++){
      productId.push(goodsList[i].productInfoId);
    }
    wx.navigateTo({
      url: '/pages/water/order/evaluate/evaluate?orderId=' + orderId + '&senderId=' + senderId + '&senderName=' + senderName + '&senderPhone=' + senderPhone + '&senderHead=' + senderHead +'&productId=' + productId,
    })
  },
  callThePhone:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.senderPhone
    })
  },

  //打开关于押金弹窗 
  showAboutDepositBox: function () {
    var state = util.modifyPopupBoxState(this.data.showAboutDepositBox)
    this.setData({
      showAboutDepositBox: state
    })
  },
  closeAboutDepositBox: function () {
    var state = util.modifyPopupBoxState(this.data.showAboutDepositBox)
    this.setData({
      showAboutDepositBox: state
    })
  },
  nowPayDeposit: function () {
    this.closeAboutDepositBox();
  },
})