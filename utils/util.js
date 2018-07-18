const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//加法精度
function addAccuracy(arg1, arg2) {
  var r1, r2, m, c;
  try {
    r1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
    r2 = 0;
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", "")) * cm;
    } else {
      arg1 = Number(arg1.toString().replace(".", "")) * cm;
      arg2 = Number(arg2.toString().replace(".", ""));
    }
  } else {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", ""));
  }
  return (arg1 + arg2) / m;
};
//分类多选
function changClassCommon(index, aType, aID, array) {
  if (index > -1) {
    aType[index].selected = !aType[index].selected;
    if (aType[index].selected) {
      if (aID.indexOf(aType[index].id) < 0) {
        aID.push(aType[index].id);
        array.push(aType[index].name);
      }
    } else {
      var idx = aID.indexOf(aType[index].id);
      aID.splice(idx, 1);
      array.splice(idx, 1);
    }
  } else {
    index = -1;
    for (let i = 0; i < aType.length; i++) {
      aType[i].selected = false;
    }
    aID = [];
    array = [];
  }
  var aArray = { aType: aType, index: index, aID: aID, array: array };
  return aArray;
}

//清空确认订单页面的缓存
function clearOrderComfireParameterCaching() {
  var deliveryTime = [];
  var remarks = [];
  var depositsComfire = [];
  wx.setStorage({
    key: 'deliveryTime',
    data: deliveryTime
  })
  wx.setStorage({
    key: 'remarks',
    data: remarks
  })
  wx.setStorage({
    key: 'depositsComfire',
    data: depositsComfire
  })
}

//打开或关闭弹窗 
function modifyPopupBoxState(state) {
  state = !state
  return state
}

function inputOrderStorage(cartItems) {
  //查看购物车里的哪些商品是勾选的
  var len = cartItems.length;
  if (len != 0) {
    var array = [];
    for (var i = 0; i < len; i++) {
      if (cartItems[i].selected) {
        array.push({
          "productInfoId": cartItems[i].id,
          "count": cartItems[i].count
        });
      }
    }
    var orderVO = {
      "productOrderVOList": array
    };
    saveOrderVO(orderVO);
  }
}

function saveAddOrderVO(id) { //缓存存入商品+1
  var orderVO = wx.getStorageSync('orderVO');
  var exist = undefined;
  if (orderVO.productOrderVOList.length > 0) {
    exist = orderVO.productOrderVOList.find(function(ele) {
      return ele.productInfoId === id
    })
  } else {
    var array = [];
    orderVO = {
      "productOrderVOList": array
    };
  }
  if (exist) { //如果存在，则增加该货品的购买数量
    exist.count = parseInt(exist.count) + 1;
  } else {
    orderVO.productOrderVOList.push({
      "productInfoId": id,
      "count": 1
    });
  }
  saveOrderVO(orderVO);
}

function saveMinusOrderVO(id) { //缓存存入商品-1
  var orderVO = wx.getStorageSync('orderVO');
  var exist = orderVO.productOrderVOList.find(function(ele) {
    return ele.productInfoId === id
  })
  if (exist) { //如果存在，则增加该货品的购买数量
    exist.count = parseInt(exist.count) - 1;
    saveOrderVO(orderVO);
  }
}

function addCountIndex(index, goods, cartItems, cartTotal, inCart, inCartNum, isChoice) {
  var id = goods[index].id;
  var name = goods[index].name;
  var amount = goods[index].amount;
  var amountShow = goods[index].amountShow;
  var productSpecifications = goods[index].productSpecifications;
  var bucketType = goods[index].bucketType;
  var selected = true; //商品是否已勾选

  inCart[index] = false;
  inCartNum[index] = inCartNum[index] + 1;
  cartTotal = cartTotal + 1;

  var exist = cartItems.find(function(ele) {
    return ele.id === id
  })
  if (exist) { //如果存在，则增加该货品的购买数量
    exist.count = parseInt(inCartNum[index]);
  } else { //如果不存在，传入该货品信息
    cartItems.push({
      id: id,
      name: name,
      count: 1,
      amount: amount,
      amountShow: amountShow,
      selected: selected,
      productSpecifications: productSpecifications,
      bucketType: bucketType
    })
  }

  saveCartStorage(cartTotal, cartItems, isChoice);
  var array = {
    cartTotal: cartTotal,
    inCart: inCart,
    inCartNum: inCartNum
  }
  return array;
}

function minusCountIndex(index, goods, cartItems, cartTotal, inCart, inCartNum, isChoice) {
  var id = goods[index].id;
  var name = goods[index].name;
  var amount = goods[index].amount;
  var amountShow = goods[index].amountShow;
  var selected = true; //商品是否已勾选

  inCartNum[index] = inCartNum[index] - 1;
  cartTotal = cartTotal - 1;

  var exist = cartItems.find(function(ele) {
    return ele.id === id
  })
  if (exist) { //如果存在，则减少该货品的购买数量
    exist.count = parseInt(inCartNum[index]);
    if (exist.count == 0) {
      for (let i = 0; i < cartItems.length; i++) {
        if (exist.id === cartItems[i].id) {
          cartItems.splice(i, 1);
          break;
        }
      }
      inCart[index] = true;
    }
  }

  saveCartStorage(cartTotal, cartItems, isChoice);
  var array = {
    cartTotal: cartTotal,
    inCart: inCart,
    inCartNum: inCartNum
  }
  return array;
}

//加入购物车数据，存入缓存
function saveCartStorage(cartTotal, cartItems, isChoice) {
  if (isChoice) {
    wx.setStorage({
      key: 'cartTotalChoice',
      data: cartTotal
    })
    wx.setStorage({
      key: 'cartItemsChoice',
      data: cartItems
    })
  } else {
    wx.setStorage({
      key: 'cartTotal',
      data: cartTotal
    })
    wx.setStorage({
      key: 'cartItems',
      data: cartItems
    })
  }
}
//判断性别
function judgeIntToSex(sex) {
  var sexArray = [{
    key: 10,
    value: '先生'
  }, {
    key: 20,
    value: '女士'
  }];
  var len = sexArray.length;
  for (let i = 0; i < len; i++) {
    if (sex == sexArray[i].key) {
      sex = sexArray[i].value;
      break;
    }
  }
  return sex;
}
//判断性别
function judgeSexToInt(sex) {
  var sexArray = [{
    key: 10,
    value: '先生'
  }, {
    key: 20,
    value: '女士'
  }];
  var len = sexArray.length;
  for (let i = 0; i < len; i++) {
    if (sex == sexArray[i].value) {
      sex = sexArray[i].key;
      break;
    }
  }
  return sex;
}
//判断桶型
function judgeBucketType(param) {
  var bucketType = [{
    key: 10,
    value: '一次性桶装水'
  }, {
    key: 20,
    value: '循环桶装水（需押金）'
  }, {
    key: 30,
    value: '瓶装水'
  }];
  var len = bucketType.length;
  for (let i = 0; i < len; i++) {
    if (param == bucketType[i].key) {
      param = bucketType[i].value;
      break;
    }
  }
  return param;
}
//水种类
function judgeWaterType(param) {
  var waterType = [{
    key: 10,
    value: '矿泉水'
  }, {
    key: 20,
    value: '山泉水'
  }, {
    key: 30,
    value: '纯净水'
  }];
  var len = waterType.length;
  for (let i = 0; i < len; i++) {
    if (param == waterType[i].key) {
      param = waterType[i].value;
      break;
    }
  }
  return param;
}
//订单状态
function judgeOrderStatus(status) {
  var statusArray = [{
    key: 10,
    value: '待支付'
  }, {
    key: 20,
    value: '待配送'
  }, {
    key: 30,
    value: '配送中'
  }, {
    key: 40,
    value: '已送达'
  }, {
    key: 50,
    value: '已关闭'
  }, {
    key: 60,
    value: '已评论'
  }];
  var len = statusArray.length;

  for (let j = 0; j < len; j++) {
    if (status == statusArray[j].key) {
      status = statusArray[j].value;
    }
  }

  return status;
}
/**
 * 向后端获取token
 * 
 * openid 微信用户与该小程序产生的唯一ID
 * username 用户名
 * unionId 微信用户与该公众号的产生的唯一ID
 */
function takeToken(openid, username, unionid, callback) {
  var openIdData = {
    "openId": openid,
    "username": username,
    "unionid": unionid
  };
  request('https://www.yunquanlai.com/client/api/wechat/login', openIdData, function(res) {
    var token = res.data.token;
    wx.setStorage({
      key: "token",
      data: token,
    });

    if (res.data.userInfo.depositAmount != undefined) {
      wx.setStorage({
        key: "deposit",
        data: res.data.deposit
      })
    }

    if (res.data.emptyBucketValue != undefined) {
      wx.setStorage({
        key: "emptyBucketValue",
        data: res.data.emptyBucketValue,
      })
    }
    if (callback) {
      callback();
    }
  });
}
function GetDateStr(AddDayCount) {
 var dd = new Date();
 dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期 
 var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期 
  var d = dd.getDate();
  return y + "-" + m + "-" + d;
}
function createSendDate() {
  var date=0;
  var dates =[];
  for(var i=0;i<6;i++){
    date = GetDateStr(i)
    dates.push(date)
  }
  return dates;
}
function createSendTime() {
  var myDate = new Date();
  var times = [];

  var myHour = 8;
  var myMinute = 0;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 6; j++) {
      times.push((myHour + i) + ':' + (myMinute + j) + '0');
    }
  }
  return times;
}

/**
 * 使用token发起请求，包含token失效处理逻辑
 * 
 */
function requestWithToken(url, data, success) {
  var token = wx.getStorageSync('token') || [];
  if (token == '') {
    wx.navigateTo({
      url: '/pages/index/index',
    })
    return;
  }
  wx.showLoading();
  wx.request({
    url: url,
    data: data,
    header: {
      'content-type': 'application/json', // 默认值
      "token": token
    },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      wx.hideLoading();
      //console.log(res);
      if (res.data.code == 501 || res.data.code == 502 || res.data.code == 503) {
        wx.clearStorageSync("token");
        wx.navigateTo({
          url: '/pages/index/index',
        })
        console.info("token 失效");
        return;
      }

      if (res.data.code == 500) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
        return;
      }

      success(res);
    },
    fail: function (res) {
      wx.hideLoading();
      console.error(res);
      wx.showToast({
        title: '网络异常请稍后再试。',
        icon: 'none',
        duration: 3000
      })
    },
    complete: function (res) {

    },
  });
}

function request(url, data, success) {
  wx.showLoading();
  wx.request({
    url: url,
    data: data,
    header: {
      'content-type': 'application/json',
    },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function(res) {
      wx.hideLoading();
      if (res.data.code != 0) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
        return;
      }

      success(res);
    },
    fail: function(res) {
      wx.hideLoading();
      console.error(res);
      wx.showToast({
        title: '网络异常请稍后再试。',
        icon: 'none',
        duration: 3000
      })
    },
    complete: function(res) {

    },
  });
}

/**
 *根据登录流程加载token（注意当token失效，需要先删除token再调用该流程）
 */
function loadToken(callBack) {
  var token = wx.getStorageSync('token') || [];
  if (token.length != 0) {
    return;
  }
  var openid = wx.getStorageSync('openid') || [];
  var unionid = wx.getStorageSync('unionid') || [];
  var username = wx.getStorageSync('username');
  if (openid != '') {
    takeToken(openid, username, unionid);
    return;
  }
  // 登录
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (res.code) {
        //发起网络请求
        var code = res.code; //返回code
        request('https://www.yunquanlai.com/client/api/wechat/user/login?code=' + code, '', function(res) {
          //console.log(res)
          if (res.data.session != undefined) {
            var openid = res.data.session.openid; //返回openid
            var unionid = res.data.session.unionid;
            if (unionid == null) {
              unionid = '';
            }
            wx.setStorage({
              key: "openid",
              data: openid
            })
            wx.setStorage({
              key: "unionid",
              data: unionid
            })
            takeToken(openid, username, unionid, callBack);
          }
        });
      } else {
        wx.showToast({
          title: '微信登录失败，请稍后再试',
          icon: 'none',
          duration: 4000
        })
      }
    }
  })

}

function pay(param) {
  wx.requestPayment({
    'timeStamp': param.timeStamp,
    'nonceStr': param.nonceStr,
    'package': param.package,
    'signType': param.signType,
    'paySign': param.paySign,
    success: function(res) {
      wx.switchTab({
        url: '/pages/water/order/order',
        success: function(res) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000
          })
        }
      })
    },
    fail: function() {
      wx.switchTab({
        url: '/pages/water/order/order',
        success: function(res) {
          wx.showToast({
            title: '支付失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  })

}

function wxPay(url) {
  requestWithToken(url, '', function(res) {
    if (res.data.code == 505) {
      wx.switchTab({
        url: '/pages/water/order/order',
        success: function(res) {
          wx.showToast({
            title: '微信支付起调失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
      return;
    }
    var wxPayResult = res.data.result;
    var timeStamp = wxPayResult.timeStamp;
    var prepay_id = wxPayResult.package;
    var sign = wxPayResult.sign;
    var signType = wxPayResult.signType;
    var nonceStr = wxPayResult.nonceStr;

    var param = {
      "timeStamp": timeStamp,
      "package": prepay_id,
      "paySign": sign,
      "signType": signType,
      "nonceStr": nonceStr
    }

    pay(param);
  });
}

function saveOrderVO(orderVO) {
  wx.setStorage({
    key: 'orderVO',
    data: orderVO
  });
}

module.exports = {
  formatTime: formatTime,
  modifyPopupBoxState: modifyPopupBoxState,
  createSendDate: createSendDate,
  createSendTime: createSendTime,
  judgeIntToSex: judgeIntToSex,
  judgeSexToInt: judgeSexToInt,
  judgeOrderStatus: judgeOrderStatus,
  takeToken: takeToken,
  addCountIndex: addCountIndex,
  minusCountIndex: minusCountIndex,
  judgeBucketType: judgeBucketType,
  saveCartStorage: saveCartStorage,
  saveAddOrderVO: saveAddOrderVO,
  saveMinusOrderVO: saveMinusOrderVO,
  inputOrderStorage: inputOrderStorage,
  clearOrderComfireParameterCaching: clearOrderComfireParameterCaching,
  judgeWaterType: judgeWaterType,
  loadToken: loadToken,
  requestWithToken: requestWithToken,
  request: request,
  wxPay: wxPay,
  pay: pay,
  changClassCommon: changClassCommon,
  addAccuracy:addAccuracy,
  saveOrderVO: saveOrderVO
}
