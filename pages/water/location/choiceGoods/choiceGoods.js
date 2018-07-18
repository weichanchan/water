const util = require('../../../../utils/util.js')

Page({
  data: {
    goods: [],
    cartTotal: 0,
    inCart: [],
    inCartNum: [],
    noData: true,
    offset: 0,
    deliveryTime: '选择时间',
    addressSelect: ''
  },
  onLoad(option) {},
  onShow: function() {
    var that = this;

    var deliveryTime = wx.getStorageSync('deliveryTime') || [];
    let addressSelect = wx.getStorageSync('addressSelect') || [];

    this.setData({
      deliveryTime: deliveryTime,
      addressSelect: addressSelect
    })

    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?isQuick=10&offset=0&limit=10',
      callback: function() {}
    });
    that.initCartTotal();


  },
  goodChioceGoods() {
    wx.navigateBack({
      delta: 1
    })
  },
  getGoodsData({
    url,
    callback
  }) {
    var that = this;
    //读取商品列表
    util.request(url, '', function(res) {
      var goods = res.data.productInfoList;
      if (goods != undefined) {
        var len = goods.length;
        if (len > 0) {
          for (var i = 0; i < len; i++) {
            goods[i].bucketType = util.judgeBucketType(goods[i].bucketType);
            that.initGoodsInCartNum(i, goods[i].id);
          }

          that.setData({
            goods: goods,
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
  initCartTotal() {
    //初始化购物车
    var that = this;
    var cartTotal = wx.getStorageSync('cartTotalChoice') || 0;

    that.setData({
      cartTotal: cartTotal,
    })
  },
  initGoodsInCartNum: function(index, id) {
    //初始化商品在购物车里的数量
    var that = this;
    var cartItems = wx.getStorageSync('cartItemsChoice') || [];
    var inCart = that.data.inCart;
    var inCartNum = that.data.inCartNum;
    var status = true;
    var exist = cartItems.find(function(ele) {
      return ele.id === id
    })
    var count = 0;
    if (exist) { //存在
      status = false;
      count = exist.count;
    } else {
      status = true;
      count = 0;
    }
    inCart[index] = status;
    inCartNum[index] = count;
    that.setData({
      inCart: inCart,
      inCartNum: inCartNum
    })
  },
  addCount(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    let goods = that.data.goods;
    let id = goods[index].id;
    var cartTotal = that.data.cartTotal;
    var inCart = that.data.inCart;
    var inCartNum = that.data.inCartNum;
    var cartItems = wx.getStorageSync('cartItemsChoice') || [];
    var isChoice = true;

    var array = util.addCountIndex(index, goods, cartItems, cartTotal, inCart, inCartNum, isChoice);
    cartTotal = array.cartTotal;
    inCart = array.inCart;
    inCartNum = array.inCartNum;

    that.setData({
      cartTotal: cartTotal,
      inCart: inCart,
      inCartNum: inCartNum
    })
    //缓存存入商品+1
    // util.saveAddOrderVO(id);
  },
  minusCount(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    let goods = that.data.goods;
    var id = goods[index].id;
    var cartTotal = that.data.cartTotal;
    var inCart = that.data.inCart;
    var inCartNum = that.data.inCartNum;
    var cartItems = wx.getStorageSync('cartItemsChoice') || [];
    var isChoice = true;

    var array = util.minusCountIndex(index, goods, cartItems, cartTotal, inCart, inCartNum, isChoice);
    cartTotal = array.cartTotal;
    inCart = array.inCart;
    inCartNum = array.inCartNum;

    that.setData({
      cartTotal: cartTotal,
      inCart: inCart,
      inCartNum: inCartNum
    })

    //缓存存入商品-1
    // util.saveMinusOrderVO(id);

  },
  onPullDownRefresh: function() {
    var that = this;
    wx.showNavigationBarLoading();
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?isQuick=10&offset=0&limit=10',
      callback: function() {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  onReachBottom: function() {
    var that = this;
    wx.showLoading({
      title: '玩命加载中',
    })

    var brandsID = that.data.brandsID;
    var bucketID = that.data.bucketID;
    var sortID = that.data.sortID;
    var offset = that.data.offset;
    offset = offset + 10;
    util.request('https://www.yunquanlai.com/client/api/queryProduct?isQuick=10&offset=' + offset + '&limit=10', '', function(res) {
      var goods = that.data.goods;
      var goodsLoad = res.data.productInfoList;
      if (goods != undefined) {
        var len = goodsLoad.length;
        if (len > 0) {
          for (var i = 0; i < len; i++) {
            goodsLoad[i].bucketType = util.judgeBucketType(goodsLoad[i].bucketType);
            that.initGoodsInCartNum(i + offset, goodsLoad[i].id);
            goods.push(goodsLoad[i]);
          }

          that.setData({
            goods: goods,
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
  }
})