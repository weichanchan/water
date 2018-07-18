const util = require('../../../utils/util.js')
var app = getApp()
Page({
  data: {
    goods: [],
    showSelectionBrandsBox: true,
    showSelectionClassificationBox: true,
    showPriceSortingBox: true,
    cartTotal: 0,
    inCart: [],
    inCartNum: [],
    brands: [],
    brandsKey: -1,
    brandsID: '',
    bucketType: [{ id: 10, name: '一次性桶装水', selected: false }, { id: 20, name: '循环桶装水（需押金）', selected: false }, { id: 30, name: '瓶装水', selected: false }],
    bucketKey: -1,
    bucketID: [],
    waterType: [{ id: 10, name: '矿泉水', selected: false }, { id: 20, name: '山泉水', selected: false }, { id: 30, name: '纯净水', selected: false }],
    waterKey: -1,
    waterID: [],
    priceSorting: [{ id: 10, name: '价格从高到低' }, { id: 20, name: '价格从低到高' }],
    sortKey: -1,
    sortID: '',
    brandsText: '品牌',
    classificationText: '分类',
    classTextArray1: [],
    classTextArray2: [],
    priceSortingText: '排序',
    noData: true,
    carBotPad: false,
    offset: 0,
    keyword: '',
    hide_good_box: true,
  },
  onLoad: function () {
    let systemInfo = wx.getStorageSync('systemInfo');
    this.busPos = {};
    this.busPos['x'] = 45;//购物车的位置
    this.busPos['y'] = app.globalData.hh - 16;
    this.setData({
      systemInfo: systemInfo,
    });
  },
  onShow: function () {
    var that = this;
    that.setData({
      offset: 0
    })
    //初始化条件筛选
    that.initSection();
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?isQuick=20&offset=0&limit=10',
      callback: function () { }
    });
    that.initCartTotal();
    that.getBrandsData();
    util.clearOrderComfireParameterCaching();
  },
  getGoodsData({ url, callback }) {
    var that = this;
    //读取商品列表
    util.request(url, '', function (res) {
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
            goods: goods,
            noData: false
          })
        }
      }
      callback();
    });
  },
  initSection() {
    let waterType = this.data.waterType;
    for (let i = 0; i < waterType.length; i++) {
      waterType[i].selected = false;
    }
    let bucketType = this.data.bucketType;
    for (let i = 0; i < bucketType.length; i++) {
      bucketType[i].selected = false;
    }
    this.setData({
      bucketType: bucketType,
      brandsKey: -1,
      brandsText: '品牌',
      brandsID: '',
      bucketKey: -1,
      classificationText: '分类',
      bucketID: [],
      waterType: waterType,
      waterKey: -1,
      waterID: [],
      sortKey: -1,
      priceSortingText: '排序',
      sortID: '',
      classTextArray1: [],
      classTextArray2: []
    })
  },
  getBrandsData() {
    var that = this;
    //读取品牌列表
    util.request('https://www.yunquanlai.com/client/api/getProductBrand', '', function (res) {
      var productBrand = res.data.productBrandEntityList;
      that.setData({
        brands: productBrand
      })
    });
  },
  initCartTotal() {
    //初始化购物车
    var that = this;
    var cartTotal = wx.getStorageSync('cartTotal') || 0;

    that.setData({
      cartTotal: cartTotal,
    })
  },
  initGoodsInCartNum: function (index, id) {
    //初始化商品在购物车里的数量
    var that = this;
    var cartItems = wx.getStorageSync('cartItems') || [];
    var inCart = that.data.inCart;
    var inCartNum = that.data.inCartNum;
    var status = true;
    var exist = cartItems.find(function (ele) {
      return ele.id === id
    })
    var count = 0;
    if (exist) {//存在
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
    var cartTotal = that.data.cartTotal;
    var inCart = that.data.inCart;
    var inCartNum = that.data.inCartNum;
    var cartItems = wx.getStorageSync('cartItems') || [];
    var isChoice = false;

    that.touchOnGoods(e);
    var array = util.addCountIndex(index, goods, cartItems, cartTotal, inCart, inCartNum, isChoice);
    cartTotal = array.cartTotal;
    inCart = array.inCart;
    inCartNum = array.inCartNum;

    that.setData({
      cartTotal: cartTotal,
      inCart: inCart,
      inCartNum: inCartNum
    })
  },
  minusCount(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    let goods = that.data.goods;
    var cartTotal = that.data.cartTotal;
    var inCart = that.data.inCart;
    var inCartNum = that.data.inCartNum;
    var cartItems = wx.getStorageSync('cartItems') || [];
    var isChoice = false;

    var array = util.minusCountIndex(index, goods, cartItems, cartTotal, inCart, inCartNum, isChoice);
    cartTotal = array.cartTotal;
    inCart = array.inCart;
    inCartNum = array.inCartNum;

    that.setData({
      cartTotal: cartTotal,
      inCart: inCart,
      inCartNum: inCartNum
    })
  },
  //打开品牌弹窗 
  showSelectionBrandsBox: function () {
    var state = util.modifyPopupBoxState(this.data.showSelectionBrandsBox)
    this.setData({
      showSelectionBrandsBox: state
    })
  },
  closeSelectionBrandsBox: function () {
    var state = util.modifyPopupBoxState(this.data.showSelectionBrandsBox)
    this.setData({
      showSelectionBrandsBox: state
    })
  },
  changBrandsColor(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    let brands = that.data.brands;

    var name = '品牌';
    let brandsID;
    if (index > -1) {
      name = brands[index].name;
      brandsID = brands[index].id;
    } else {
      index = -1;
      brandsID = '';
    }
    that.setData({
      brandsKey: index,
      brandsText: name,
      brandsID: brandsID
    })
    that.closeSelectionBrandsBox()

    var bucketID = that.data.bucketID;
    var waterID = that.data.waterID;
    var sortID = that.data.sortID;
    var keyword = that.data.keyword;
    //查询数据
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?name=' + keyword + '&brandId=' + brandsID + '&bucketType=' + bucketID + '&waterType=' + waterID + '&orderType='  + '&orderType=' + sortID + '&isQuick=20&offset=0&limit=10',
      callback: function () { }
    });
  },
  //打开分类弹窗 
  showSelectionClassificationBox: function () {
    var state = util.modifyPopupBoxState(this.data.showSelectionClassificationBox)
    this.setData({
      showSelectionClassificationBox: state
    })
  },
  closeSelectionClassificationBox: function () {
    var state = util.modifyPopupBoxState(this.data.showSelectionClassificationBox)
    this.setData({
      showSelectionClassificationBox: state
    })
  },
  closeClearSelectionClassificationBox() {
    var that = this;
    that.closeSelectionClassificationBox();
    that.setData({
      brandsKey: that.data.brandsKey,
      brandsText: that.data.brandsText,
      brandsID: that.data.brandsID,
      bucketKey: that.data.bucketKey,
      classificationText: that.data.classificationText,
      bucketID: that.data.bucketID,
      waterType: that.data.waterType,
      waterKey: that.data.waterKey,
      waterID: that.data.waterID,
      sortKey: that.data.sortKey,
      priceSortingText: that.data.priceSortingText,
      sortID: that.data.sortID,
      classTextArray1: that.data.classTextArray1,
      classTextArray2: that.data.classTextArray2
    })
  },
  changBucketColor(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var bucketType = that.data.bucketType;
    var bucketID = that.data.bucketID;
    var classTextArray1 = that.data.classTextArray1;
    var aArray = util.changClassCommon(index, bucketType, bucketID, classTextArray1);
    that.setData({
      bucketType: aArray.aType,
      bucketKey: aArray.index,
      bucketID: aArray.aID,
      classTextArray1: aArray.array
    })
  },
  changWaterColor(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var waterType = that.data.waterType;
    var waterID = that.data.waterID;
    var classTextArray2 = that.data.classTextArray2;
    var aArray = util.changClassCommon(index, waterType, waterID, classTextArray2);
    that.setData({
      waterType: aArray.aType,
      waterKey: aArray.index,
      waterID: aArray.aID,
      classTextArray2: aArray.array
    })
  },

  confirmDoneClass() {
    var that = this;
    var brandsID = that.data.brandsID;
    var bucketID = that.data.bucketID;
    var waterID = that.data.waterID;
    var sortID = that.data.sortID;
    var keyword = that.data.keyword;

    //查询数据
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?name=' + keyword + '&brandId=' + brandsID + '&bucketType=' + bucketID + '&waterType=' + waterID + '&orderType=' + '&orderType=' + sortID + '&isQuick=20&offset=0&limit=10',
      callback: function () { }
    });

    var classTextArray1 = that.data.classTextArray1.join(',');
    var classTextArray2 = that.data.classTextArray2.join(',');
    var classTextArray = [];

    if (classTextArray1 == '' && classTextArray2 == '') {
      classTextArray = '分类'
    } else if (classTextArray1 == '') {
      classTextArray = classTextArray2;
    } else if (classTextArray2 == '') {
      classTextArray = classTextArray1;
    } else {
      classTextArray = classTextArray1 + ',' + classTextArray2;
    }
    that.setData({
      classificationText: classTextArray
    })
    that.closeSelectionClassificationBox();
  },
  //打开价格排序弹窗 
  showPriceSortingBox: function () {
    var state = util.modifyPopupBoxState(this.data.showPriceSortingBox)
    this.setData({
      showPriceSortingBox: state
    })
  },
  closePriceSortingBox: function () {
    var state = util.modifyPopupBoxState(this.data.showPriceSortingBox)
    this.setData({
      showPriceSortingBox: state
    })
  },
  changPriceSortingColor(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    let priceSorting = that.data.priceSorting;
    var name = '默认排序';

    let sortID;
    if (index > -1) {
      name = priceSorting[index].name;
      sortID = priceSorting[index].id;
    } else {
      index = -1;
      sortID = '';
    }

    that.setData({
      sortKey: index,
      priceSortingText: name,
      sortID: sortID
    })
    that.closePriceSortingBox();

    var brandsID = that.data.brandsID;
    var bucketID = that.data.bucketID;
    var waterID = that.data.waterID;
    var keyword = that.data.keyword;
    //查询数据
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?name=' + keyword + '&brandId=' + brandsID + '&bucketType=' + bucketID + '&waterType=' + waterID + '&orderType=' + '&orderType=' + sortID + '&isQuick=20&offset=0&limit=10',
      callback: function () { }
    });
  },
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading();
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?isQuick=20&offset=0&limit=10',
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

    var brandsID = that.data.brandsID;
    var bucketID = that.data.bucketID;
    var waterID = that.data.waterID;
    var sortID = that.data.sortID;
    var keyword = that.data.keyword;
    var offset = that.data.offset;
    offset = offset + 10;

    util.request('https://www.yunquanlai.com/client/api/queryProduct?name=' + keyword + '&brandId=' + brandsID + '&bucketType=' + bucketID + '&waterType=' + waterID + '&orderType=' + '&orderType=' + sortID + '&isQuick=20&offset=' + offset + '&limit=10', '', function (res) {
      var goods = that.data.goods;
      var goodsLoad = res.data.productInfoList;
      if (goodsLoad != undefined) {
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

  },
  bindKeywordInput: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  confirmSearch() {
    var that=this;
    var brandsID = that.data.brandsID;
    var bucketID = that.data.bucketID;
    var sortID = that.data.sortID;
    var waterID = that.data.waterID;
    var keyword = that.data.keyword;
    //查询数据
    that.getGoodsData({
      url: 'https://www.yunquanlai.com/client/api/queryProduct?name=' + keyword + '&brandId=' + brandsID + '&bucketType=' + bucketID + '&waterType=' + waterID + '&orderType=' + '&orderType=' + sortID + '&isQuick=20&offset=0&limit=10',
      callback: function () { }
    });
  },
  touchOnGoods: function (e) {
    this.finger = {}; var topPoint = {};
    this.finger['x'] = e.touches["0"].clientX;//点击的位置
    this.finger['y'] = e.touches["0"].clientY;

    if (this.finger['y'] < this.busPos['y']) {
      topPoint['y'] = this.finger['y'] - 150;
    } else {
      topPoint['y'] = this.busPos['y'] - 150;
    }
    topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;

    if (this.finger['x'] > this.busPos['x']) {
      topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
    } else {
      topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
    }
    this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);
    this.startAnimation(e);
  },
  startAnimation: function (e) {
    var index = 0, that = this,
      bezier_points = that.linePos['bezier_points'];

    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len
    this.timer = setInterval(function () {
      index--;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index < 1) {
        clearInterval(that.timer);
        that.setData({
          hide_good_box: true
        })
      }
    }, 22);
  },
})