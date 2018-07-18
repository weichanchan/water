// pages/water/shoppingCart/shoppingCart.js
const util = require('../../../utils/util.js')
const app = getApp()
Page({
  data: {
    cartItems: [],
    hasList: false,
    totalPrice: 0,
    selectAllStatus: true,
    showPopupBox: true,
    cartTotal: 0,
    inCart: [],
    inCartNum: [],
    index: 0
  },
  onLoad: function(options) {},
  onShow: function() {
    var that = this;
    var hasList = that.data.hasList;
    let selectAllStatus = that.data.selectAllStatus;
    var cartTotal = wx.getStorageSync('cartTotal') || [];
    var cartItems = wx.getStorageSync('cartItems') || [];
    if (cartItems == '') {
      hasList = false;
      selectAllStatus = false;
    } else {
      hasList = true;
      selectAllStatus = true;
    }
    that.setData({
      hasList: hasList,
      selectAllStatus: selectAllStatus,
      cartItems: cartItems,
      cartTotal: cartTotal
    });
    that.getTotalPrice();

    //读取购物车，存入订单缓存
    util.inputOrderStorage(cartItems);

    util.clearOrderComfireParameterCaching();
  },
  gotoOrderConfirme() {
    var that = this;
    var totalPrice = that.data.totalPrice;
    if (totalPrice > 0) {
      wx.navigateTo({
        url: '/pages/water/order/confirm/confirm',
      })
    } else {
      wx.showToast({
        title: "请选择商品",
        icon: "none",
        durantion: 2000
      })
    }
  },
  getTotalPrice() {
    let cartItems = this.data.cartItems;
    let total = 0;
    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].selected) {
        total += cartItems[i].count * cartItems[i].amount;
      }
    }
    this.setData({
      cartItems: cartItems,
      totalPrice: total.toFixed(2)
    });
  },
  selectList(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    let cartItems = that.data.cartItems;
    const selected = cartItems[index].selected;
    var selectAllStatus = selected;
    cartItems[index].selected = !selected;
    var selectAllStatus = true;

    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].selected == false) {
        selectAllStatus = false;
        break;
      }
    }

    that.setData({
      selectAllStatus: selectAllStatus,
      cartItems: cartItems
    });
    wx.setStorage({
      key: 'cartItems',
      data: cartItems
    })
    that.getTotalPrice();

    if (!selected) {
      //缓存存入勾选商品
      var orderVO = wx.getStorageSync('orderVO') || {
        "productOrderVOList": []
      };
      orderVO.productOrderVOList.push({
        "productInfoId": cartItems[index].id,
        "count": cartItems[index].count
      });
      util.saveOrderVO(orderVO);
    } else {
      //缓存减掉勾选商品
      var orderVO = wx.getStorageSync('orderVO');
      let len = orderVO.productOrderVOList.length;
      for (let i = 0; i < len; i++) {
        if (orderVO.productOrderVOList[i].productInfoId === cartItems[index].id) {
          orderVO.productOrderVOList.splice(i, 1);
          break;
        }
      }
      util.saveOrderVO(orderVO);
    }
  },
  selectAll(e) {
    var that = this;
    let selectAllStatus = that.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    var cartItems = that.data.cartItems;

    for (let i = 0; i < cartItems.length; i++) {
      cartItems[i].selected = selectAllStatus;
    }
    that.setData({
      selectAllStatus: selectAllStatus,
      cartItems: cartItems
    });
    that.getTotalPrice();

    var cartItems = wx.getStorageSync('cartItems') || [];
    util.inputOrderStorage(cartItems);

  },
  addCount(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    let cartItems = that.data.cartItems;
    let id = cartItems[index].id;
    let count = cartItems[index].count;
    var isChoice = false;
    var cartTotal = that.data.cartTotal;

    count = count + 1;
    cartItems[index].count = count;
    cartTotal = cartTotal + 1;
    that.setData({
      cartItems: cartItems,
      cartTotal: cartTotal
    });
    that.getTotalPrice();
    util.saveCartStorage(cartTotal, cartItems, isChoice);

    if (cartItems[index].selected) { //该商品是否勾选
      //缓存存入商品+1
      util.saveAddOrderVO(cartItems[index].id);
    }
  },
  minusCount(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    let cartItems = that.data.cartItems;
    let count = cartItems[index].count;
    var isChoice = false;
    var cartTotal = that.data.cartTotal;

    if (count > 1) {
      count = count - 1;
      cartItems[index].count = count;
      cartTotal = cartTotal - 1;

      that.setData({
        cartItems: cartItems,
        cartTotal: cartTotal
      });
      that.getTotalPrice();
      util.saveCartStorage(cartTotal, cartItems, isChoice);

      if (cartItems[index].selected) { //该商品是否勾选
        //缓存存入商品-1
        util.saveMinusOrderVO(cartItems[index].id);
      }

    } else {
      that.showPopupBox();
      that.setData({
        index: index
      })
    }
  },
  //确认删除
  confirmDelele: function() {
    var that = this;
    const index = that.data.index;
    let cartItems = that.data.cartItems;
    var isChoice = false;
    var cartTotal = that.data.cartTotal;
    //缓存存入商品-1
    if (cartItems[index].selected) { //该商品是否勾选
      var orderVO = wx.getStorageSync('orderVO');
      let len = orderVO.productOrderVOList.length;
      for (let i = 0; i < len; i++) {
        if (orderVO.productOrderVOList[i].productInfoId === cartItems[index].id) {
          orderVO.productOrderVOList.splice(i, 1);
          util.saveOrderVO(orderVO);
          break;
        }
      }
    }

    cartItems.splice(index, 1);
    cartTotal = cartTotal - 1;
    that.setData({
      cartItems: cartItems,
      cartTotal: cartTotal
    });

    if (cartItems.length == 0) { //购物车商品为0
      that.setData({
        hasList: false,
        selectAllStatus: false
      });
    }
    that.getTotalPrice();
    util.saveCartStorage(cartTotal, cartItems, isChoice);
    that.setData({
      showPopupBox: true
    })
  },
  showPopupBox: function() {
    this.setData({
      showPopupBox: !this.data.showPopupBox
    })
  },
  //取消按钮  
  cancelDelele: function() {
    this.setData({
      showPopupBox: true
    });
  }
})