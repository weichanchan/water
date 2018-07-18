const util = require('../../../utils/util.js')
const app = getApp()
Page({
  data: {
    goodsList: [],
    orderToken: '',
    markers: [],
    locationY: 0, //经度
    locationX: 0, //纬度
    id: 0,
    name: '',
    sex: '',
    sexText: '',
    phone: '',
    addressDetail:'',
    cartTotal: 0,
    amountTotal: 0,
    inCart: [],
    inCartNum: [],
    hadChoice: true,
    canSentDown: true,
    dataFull: false,
    showSendTimeBox: true,
    isLoadDepositArea: false,
    deliveryTime: '',
    showDepositBox: true,
    deposits: [],
    depositsKey: 0,
    deposit: 0,
    hasDeposit: false,
    dates: [],
    date: 0,
    times: [],
    time: 0,
    value: [0, 0],
    remarks:''
  },
  onLoad: function(options) {
    
  },
  onShow: function() {
    var that = this;

    //读取购物车，存入订单缓存
    var cartItems = wx.getStorageSync('cartItemsChoice') || [];
    util.inputOrderStorage(cartItems);

    var cartTotal = wx.getStorageSync('cartTotalChoice') || 0;
    if (cartTotal > 0) {
      that.setData({
        hadChoice: false,
        cartTotal: cartTotal
      })
      that.getOrderConfirmData('https://www.yunquanlai.com/client/api/orderConfirm');
    } else {
      that.setData({
        hadChoice: true,
        cartTotal: cartTotal
      })
    }

    //下单时间
    var deliveryTime = wx.getStorageSync('deliveryTime') || [];
    if (deliveryTime == '') {
      deliveryTime = '立即'
    }
    that.setData({
      deliveryTime: deliveryTime
    })

    that.getLocation();
    that.getDepositAreaData('https://www.yunquanlai.com/client/api/depositArea');

    //备注
    var remarks = wx.getStorageSync('remarks') || '';
    if (remarks==''){
      remarks=''
    }

    //是否有押金
    var hasDeposit = that.data.hasDeposit;
    
    //读取押金缓存
    that.setData({
      depositsKey: 0,
      deposit: 0,
      bucketNum: 0,
      hasDeposit: hasDeposit,
      remarks:remarks
    })

    //是否填完信息
    var addressDetail = that.data.addressDetail;
    var deliveryTime = that.data.deliveryTime;
    var dataFull = that.data.dataFull;

    if (addressDetail != '' && cartTotal != 0 && deliveryTime != '') {
      dataFull = true;
    } else {
      dataFull = false;
    }
    that.setData({
      dataFull: dataFull
    })
    wx.setStorage({
      key: 'dataFull',
      data: dataFull
    })

  },
  //打开押金弹窗 
  showDepositBox: function () {
    var state = util.modifyPopupBoxState(this.data.showDepositBox)
    this.setData({
      showDepositBox: state
    })
  },
  closeDepositBox: function () {
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
  getOrderConfirmData(url) {
    var that = this;
    var orderVO = wx.getStorageSync('orderVO');
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
        hasDeposit = false;
      }

      if (deposit > 0) {
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
  gotoPay: function () {
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

    var userAddress = that.data.address;
    var userName = that.data.name;
    var userSex = that.data.sex;
    userSex = util.judgeSexToInt(userSex);
    var userPhone = that.data.phone;
    var remarks = that.data.remarks;
    var deliveryTime = that.data.deliveryTime == "立即" ? '' : that.data.deliveryTime;
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
      "deliveryTime": deliveryTime
    };

    orderVODetails = JSON.stringify(orderVODetails);
    var orderDetialsLen = orderVODetails.length;
    orderVODetails = orderVODetails.substr(0, orderDetialsLen - 1) + ',';
    orderVO = JSON.stringify(orderVO).substr(1);
    orderVODetails = orderVODetails + orderVO;

    //console.log(orderVODetails);

    orderVODetails = JSON.parse(orderVODetails);

    util.requestWithToken(url, orderVODetails, function (res) {
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
        key: 'depositsComfire',
        data: []
      })

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
  getDepositAreaData(url) {
    var that = this;
    var isLoadDepositArea = that.data.isLoadDepositArea;
    if(isLoadDepositArea){
      return;
    }
    isLoadDepositArea = true;
    that.setData({
      isLoadDepositArea: isLoadDepositArea
    });
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
  getLocation: function() {
    var that = this;
    var addressSelect = wx.getStorageSync('addressSelect') || [];

    if (addressSelect != '') {
      var id = addressSelect.id;
      var name = addressSelect.name;
      var sex = addressSelect.sex;
      var sexText = util.judgeIntToSex(sex);
      var phone = addressSelect.phone;
      var address = addressSelect.address;
      var addressDetail = addressSelect.addressDetail;
      var locationY = addressSelect.locationY;
      var locationX = addressSelect.locationX;

      that.setData({
        id: id,
        name: name,
        sex: sex,
        sexText: sexText,
        phone: phone,
        address: address + ' ' + addressDetail,
        addressDetail: addressDetail
      })
      that.initSign(locationY, locationX);
    } else {
      //获取当前定位
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          //console.log(res);
          var locationY = res.longitude
          var locationX = res.latitude
          that.setData({
            locationY: locationY,
            locationX: locationX
          })

          //发送经纬度获取最近地址
          util.requestWithToken('https://www.yunquanlai.com/client/api/getMinDistanceAddress?locationY=' + locationY + '&locationX=' + locationX, '', function(res) {
            //console.log(res.data);
            var minUserAddress = res.data.minUserAddress;

            if (minUserAddress != null) {
              var id = minUserAddress.id;
              var address = minUserAddress.address;
              var addressDetail = minUserAddress.addressDetail;
              var name = minUserAddress.name;
              var phone = minUserAddress.phone;
              var sex = minUserAddress.sex;
              var sexText = util.judgeIntToSex(sex);
              var locationY2 = minUserAddress.locationY;
              var locationX2 = minUserAddress.locationX;

              that.setData({
                id: id,
                name: name,
                sex: sex,
                sexText: sexText,
                phone: phone,
                address: address + ' ' + addressDetail,
                addressDetail: addressDetail,
                locationY: locationY2,
                locationX: locationX2
              })

              //存入缓存地址
              let addressSelect = minUserAddress;
              wx.setStorage({
                key: 'addressSelect',
                data: addressSelect
              })
              that.initSign(locationY2, locationX2);
            } else { //没有地址列表，就显示当前所在位置
              var locationY = that.data.locationY;
              var locationX = that.data.locationX;
              that.setData({
                id: 0,
                name: '',
                sex: 0,
                sexText: '',
                phone: '',
                address: '',
                addressDetail: ''
              })
              that.initSign(locationY, locationX);
            }
          });
        }
      })
    }
  },
  initSign(longitude, latitude) {
    this.setData({
      locationY: longitude,
      locationX: latitude,
      markers: [{
        iconPath: "/images/location.png",
        id: 0,
        latitude: latitude,
        longitude: longitude,
        width: 30,
        height: 48,
        callout: {
          content: '送到这里|修改',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 10,
          bgColor: '#ef540f',
          padding: 6,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      }]
    });
  },
  sendThisAddress(e) {
    //console.log(e.markerId)
    this.gotoUserAddress();
  },
  regionchange(e) {
    var that = this;
    //console.log(e.type)
    if (e.type == 'end') {
      that.getCenterLocation();
    }
  },
  getCenterLocation: function() {
    var that = this;
    that.mapCtx = wx.createMapContext('myMap');
    that.mapCtx.getCenterLocation({
      success: function(res) {
        //console.log(res.longitude)
        //console.log(res.latitude)
      }
    })
  },
  markertap(e) {
    //console.log(e.markerId)
  },
  controltap(e) {
    //console.log(e.controlId)
  },
  getUserAddress() {
    this.gotoUserAddress();
  },
  gotoUserAddress() {
    var id = this.data.id;
    wx.navigateTo({
      url: '/pages/water/location/choiceAddress/choiceAddress?id=' + id,
    })
  },
  getChoiceGoods() {
    wx.navigateTo({
      url: '/pages/water/location/choiceGoods/choiceGoods'
    })
  },
  getChoiceDate() {
    wx.navigateTo({
      url: '/pages/water/location/choiceDate/choiceDate'
    })
  },
  getRemarks() {
    wx.navigateTo({
      url: '/pages/water/location/remarks/remarks'
    })
  }
})