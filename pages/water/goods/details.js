var WxParse= require('../../../wxParse/wxParse.js');
const util = require('../../../utils/util.js')
var app = getApp()
Page({
  data: {
    id:0,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    name: '',
    amountShow: '',
    amount: '',
    bucketType: '',
    productSpecifications:'',
    content:'',
    stock: 0,
    count: 0,
    goodsDetailsDisplay: true,
    goodsEvaluateDisplay: false,
    carBotPad: true,
    goodsScoreTotal: 0,
    goodsScore: [0, 0, 0, 0, 0],
    offset: 0,
    noData:true,
    comments: [],
    cartTotal: 0,
    hide_good_box: true,
  },
  onLoad:function(options){
    var id = parseInt(options.id);
    this.setData({
      id: id
    });
    let systemInfo = wx.getStorageSync('systemInfo');
    this.busPos = {};
    this.busPos['x'] = 45;//购物车的位置
    this.busPos['y'] = app.globalData.hh - 56;
    this.setData({
      systemInfo: systemInfo,
    });
  },
  onShow() {
    var that = this;
    var id = that.data.id; 
    that.getGoodsDetailsData(id);
    that.getCommentData(id);
    that.initCartTotal();
  },
  initCartTotal() {
    //初始化购物车
    var that = this;
    var cartTotal = wx.getStorageSync('cartTotal') || 0;

    that.setData({
      cartTotal: cartTotal,
    })
  },
  getGoodsDetailsData(id){
    var that=this;
    //商品
    util.request('https://www.yunquanlai.com/client/api/getProductDetail?id=' + id, '', function (res) {
      //console.log(res.data.productInfoVO);
      var goodsDetailsInfo = res.data.productInfoVO;
      var banner = (goodsDetailsInfo.productDetailEntity.banner).split(',');
      var bucketType = util.judgeBucketType(goodsDetailsInfo.bucketType);
      var productSpecifications = goodsDetailsInfo.productSpecifications;
      var goodsScore = that.data.goodsScore;
      var goodsScoreTotal = goodsDetailsInfo.productDetailEntity.averageLevel;
      var len = Math.ceil(goodsScoreTotal);

      for (let i = 0; i < len; i++) {
        goodsScore[i] = 1;
      }

      var article = goodsDetailsInfo.content;
      WxParse.wxParse('article', 'html', article, that);

      that.setData({
        imgUrls: banner,
        name: goodsDetailsInfo.name,
        amountShow: goodsDetailsInfo.amountShow,
        amount: goodsDetailsInfo.amount,
        bucketType: bucketType,
        productSpecifications: productSpecifications,
        content: goodsDetailsInfo.content,
        count: goodsDetailsInfo.productInfoEntity.count,
        stock: goodsDetailsInfo.stock,
        goodsScoreTotal: goodsScoreTotal,
        goodsScore: goodsScore
      })
    });
  },
  getCommentData(id) {
    var that = this;
    util.request('https://www.yunquanlai.com/client/api/query?productId=' + id + '&offset=0&limit=10', '', function (res) {
      var commentProductList = res.data.commentProductList;
      //console.log(commentProductList);
      var len = commentProductList.length;
      var comments = [];

      for (let i = 0; i < len; i++) {
        var id = parseInt(commentProductList[i].id);
        var name = commentProductList[i].userName;
        var img = '/images/defaultHead.png';
        if (commentProductList[i].headUrl != null) {
          img = commentProductList[i].headUrl;
        }
        var scoreTotal = commentProductList[i].level;
        var comment = commentProductList[i].comment;
        var creationTime = commentProductList[i].creationTime;

        var level = [0, 0, 0, 0, 0];
        for (let k = 0; k < scoreTotal; k++) {
          level[k] = 1;
        }

        comments.push({ id: id, name: name, img: img, level: level, comment: comment, creationTime: creationTime });
      }

      that.setData({
        comments: comments
      })
    });
  },
  showDetails: function () {
    this.setData({
      goodsDetailsDisplay: true,
      goodsEvaluateDisplay: false
    })
  },
  showvaluate: function () {
    this.setData({
      goodsDetailsDisplay: false,
      goodsEvaluateDisplay: true
    })
  },
  onReachBottom: function () {
    var that = this;
    wx.showLoading({
      title: '玩命加载中',
    })

    var id = that.data.id;
    var offset = that.data.offset;
    offset = offset + 10;

    util.request('https://www.yunquanlai.com/client/api/query?productId=' + id + '&offset=' + offset + '&limit=10', '', function (res) {
      var comments = that.data.comments;
      var commentProductList = res.data.commentProductList;
      var commentsLoad = [];
      var len = commentProductList.length;

      if (len != 0) {
        for (let i = 0; i < len; i++) {
          var id = parseInt(commentProductList[i].id);
          var name = commentProductList[i].userName;
          var img = '/images/defaultHead.png';
          if (commentProductList[i].headUrl != null) {
            img = commentProductList[i].headUrl;
          }
          var scoreTotal = commentProductList[i].level;
          var comment = commentProductList[i].comment;
          var creationTime = commentProductList[i].creationTime;

          var level = [0, 0, 0, 0, 0];
          for (let k = 0; k < scoreTotal; k++) {
            level[k] = 1;
          }

          commentsLoad.push({ id: id, name: name, img: img, level: level, comment: comment, creationTime: creationTime });
        }
        comments.push(commentsLoad);
        that.setData({
          comments: comments,
          offset: offset
        })
      }
      if (len == 0) {
        that.setData({
          noData: false
        })
      } else {
        that.setData({
          noData: true
        })
      }
      wx.hideLoading();
    });
  },
  addToCart(e){
    var that = this;

    var cartTotal = that.data.cartTotal;
    var cartItems = wx.getStorageSync('cartItems') || [];
    var isChoice = false;

    var id = that.data.id;
    var name = that.data.name;
    var amount = that.data.amount;
    var amountShow = that.data.amountShow;
    var selected = true;//商品是否已勾选

    that.touchOnGoods(e);
    cartTotal = cartTotal + 1;

    var exist = cartItems.find(function (ele) {
      return ele.id === id
    })
    if (exist) {//如果存在，则增加该货品的购买数量
      exist.count = parseInt(exist.count+1);
    } else {//如果不存在，传入该货品信息
      cartItems.push({
        id: id,
        name: name,
        count: 1,
        amount: amount,
        amountShow: amountShow,
        selected: selected
      })
    }

    util.saveCartStorage(cartTotal, cartItems, isChoice);

    that.setData({
      cartTotal: cartTotal
    })

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