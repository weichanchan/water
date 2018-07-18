// pages/water/user/address/address.js
const util = require('../../../../utils/util.js')
Page({
  data: {
    id:0,
    address: [],
    isOrderDetails: false,
    noData: true
  },
  onLoad: function (options) {
    if (options.id != undefined) {
    var id = options.id;
    this.setData({
      id: id
    })
    }
  },
  onShow: function() {
    var that = this;
    that.getAddressData('https://www.yunquanlai.com/client/api/getAddress');
  },
  selectList(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    var address = that.data.address;
    let addressSelect = wx.getStorageSync('addressSelect')||[];
    const selected = address[index].selected;
    address[index].selected = !selected;
    that.setData({
      address: address
    });

    addressSelect=address[index];
      wx.setStorage({
        key: 'addressSelect',
        data: addressSelect
    })
      wx.navigateBack({
        delta: 1
      })
  },
  getAddressData: function(url) {
    var that = this;
    util.requestWithToken(url, '', function (res) {
      let addressSelect = wx.getStorageSync('addressSelect') || [];
      var id = addressSelect.id;
      var id = that.data.id;
      var address = res.data.userAddressEntityList;
      if (address != undefined) {
        var len = address.length;
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            address[i].sexText = util.judgeIntToSex(address[i].sex);
            if (id != undefined) {//已选地址不为空
              if (address[i].id == id) {
                address[i].selected = true;
              } else {
                address[i].selected = false;
              }
            } else {
              if (address[i].id == id) {
                address[i].selected = true;
              } else {
                address[i].selected = false;
              }
            }
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