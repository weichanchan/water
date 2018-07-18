// pages/water/user/address/address.js
const util = require('../../../../utils/util.js')
Page({
  data: {
    address: [],
    noData: true
  },
  onShow: function() {
    var that = this;
    that.getAddressData('https://www.yunquanlai.com/client/api/getAddress');
  },
  getAddressData: function(url) {
    var that = this;
    //读取订单列表
    util.requestWithToken(url, '', function success(res) {
      var address = res.data.userAddressEntityList;
      if (address != undefined) {
        var len = address.length;
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            address[i].sex = util.judgeIntToSex(address[i].sex);
          }
          that.setData({
            address: address,
            noData: true
          })
        } else {
          that.setData({
            noData: false
          })
        }
      }
    });
  },
})