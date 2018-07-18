// pages/water/order/evaluate/evaluate.js
const util = require('../../../../utils/util.js')
Page({
  data: {
    orderId: 0,
    productId:[],
  goods:[],
  senderId: null,
  senderName: null,
  senderPhone: null,
  senderHead: null,
  senderScore: [0,0,0,0,0],
  senderComment: null,
  hadSenderHead:false,
  senderScoreTotal:0
  },
  onLoad: function (options) {
    var orderId = options.orderId;
    var senderId = options.senderId;
    var senderName = options.senderName;
    var senderPhone = options.senderPhone;
    var senderHead = options.senderHead;
    var productId = options.productId;
    var hadSenderHead = this.data.hadSenderHead;
    if (senderHead!='null'){
      hadSenderHead=true;
    }

    this.setData({
      orderId: orderId,
      productId: productId,
      senderId: senderId,
      senderName: senderName,
      senderPhone: senderPhone,
      senderHead: senderHead,
      hadSenderHead: hadSenderHead
    })
  },
  onShow: function () {
    var that = this;
    var productId = that.data.productId.split(',');
    for (let i = 0; i < productId.length; i++) {
    //商品
      util.request('https://www.yunquanlai.com/client/api/getProductDetail?id=' + productId[i], '', function (res) {
        //console.log(res.data)
        var goodsDetailsInfo = res.data.productInfoVO;
        var id = goodsDetailsInfo.id;
        var name = goodsDetailsInfo.name;
        var img = goodsDetailsInfo.img;
        var goods = that.data.goods;
        var level = [];
        for (let i = 0; i < 5; i++) {
          level.push({ id: id, score: 0 });
        }
        goods.push({ id: id, name: name, img: img, level: level, scoreTotal: 0, comment: '' });

        that.setData({
          goods: goods
        })
      });
    }
  },
  formSubmit: function (e) {
    var that = this;
    var orderId = that.data.orderId;
    var senderId = that.data.senderId;
    var goods = that.data.goods;
    var senderScore = that.data.senderScore;
    var senderScoreTotal = that.data.senderScoreTotal;
    var senderComment = that.data.senderComment;
    var goodsScoreTotal=1;

    if (senderScoreTotal == 0) {
      wx.showToast({
        title: '请为配送员评分',
        icon: "none",
        duration: 2000
      })
    }
    var len = goods.length;
    var commentProductEntities = [];
    for (let i = 0; i < len; i++) {
      var goodsLevel = goods[i].scoreTotal;
      if (goodsLevel == 0) {
        goodsScoreTotal = 0;
        wx.showToast({
          title: '请为商品评分',
          icon: "none",
          duration: 2000
        })
        break;
      }else{
        commentProductEntities.push({ "productId": goods[i].id, "comment": goods[i].comment, "level": goods[i].scoreTotal});
      }
    }
    var evaluates = {"orderId": orderId, "commentDeliveryEntity": { "deliveryDistributorId": senderId, "comment": senderComment, "level": senderScoreTotal }, "commentProductEntities": commentProductEntities};

    if (senderScoreTotal != 0 && goodsScoreTotal!=0) {
      that.saveCommentData('https://www.yunquanlai.com/client/api/comment', evaluates);
    }
  },
  saveCommentData: function (url, evaluates) {
    util.requestWithToken(url, evaluates, function success(res) {
      //console.log(res);
      wx.navigateBack({
        delta: 1,
        success: function (res) {
          wx.showToast({
            title: '评价成功',
            icon: 'success',
            duration: 2000
          })
        }
      })
    })
  },
  clickGoodsStar(e) {
    var that = this;
    const key = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var goods = that.data.goods;
    var len = goods.length;

    for (let i = 0; i < len; i++) {
      for (let k = 0; k < 5; k++) {
        if (goods[i].id == id) {
        goods[i].level[k].score = 0;
        goods[i].scoreTotal = 0;
      }
      }
      for (let j = 0; j <= key; j++) {
  if (goods[i].id == id){
    goods[i].level[j].score = 1;
    goods[i].scoreTotal += 1;
  }
}
    }
    that.setData({
      goods: goods
    })
  },
  bindGoodsComment: function (e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    var goods = that.data.goods;
    goods[index].comment = e.detail.value
    that.setData({
      goods: goods
    })
  },
  clickSenderStar(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    var senderScore = that.data.senderScore;
    var senderScoreTotal = 0;

    for (let k = 0; k < 5; k++) {
      senderScore[k] = 0;
    }
    for (let i = 0; i <= index; i++) {
      senderScore[i] = 1;
      senderScoreTotal+=1;
    }

    that.setData({
      senderScore: senderScore,
      senderScoreTotal: senderScoreTotal
    })
  },
  bindSenderComment: function (e) {
    var that = this;
    var senderComment = that.data.senderComment;
    senderComment = e.detail.value
    that.setData({
      senderComment: senderComment
    })
  },
})