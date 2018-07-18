// pages/water/user/address/eidtAddress/edit.js
const util = require('../../../../../utils/util.js')
Page({
  data: {
    id: '',
    showSexBox: true,
    sexArray: [{
      key: 10,
      value: '先生'
    }, {
      key: 20,
      value: '女士'
    }],
    sexKey: 0,
    locationY: 0,
    locationX: 0,
    address: '',
    addressDetail: '',
    name: '',
    phone: '',
    textShow: false
  },
  onLoad: function(options) {
    var that = this;
    if (options.id != undefined){
    var id = options.id;
    that.setData({
      id: id
    });
    that.getAddressData('https://www.yunquanlai.com/client/api/getAddress?id=' + id, id);
    }
  },
  getAddressData: function(url, id) {
    var that = this;
    util.requestWithToken(url, '', function success(res) {
      var address = res.data.userAddressEntityList;
      var len = address.length;
      var sexArray = that.data.sexArray;
      var sexKey = that.data.sexKey;

      for (let i = 0; i < len; i++) {
        if (address[i].id == id) {

          var sex = address[i].sex;
          var len2 = sexArray.length;
          for (let j = 0; j < len2; j++) {
            if (sex == sexArray[j].key) {
              sexKey = j;
              break;
            }
          }

          that.setData({
            sexKey: sexKey,
            address: address[i].address,
            addressDetail: address[i].addressDetail,
            name: address[i].name,
            phone: address[i].phone,
            locationY: address[i].locationY,
            locationX: address[i].locationX
          })
          break;
        }
      }
    });
  },
  saveAddressData: function(url,address) {
    util.requestWithToken(url, address, function success(res) {
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 4000
      })
    });
  },
  formSubmit: function(e) {
    var that=this;
    var id = parseInt(that.data.id);
    var name = that.data.name;
    var phone = that.data.phone;
    var address = that.data.address;
    var addressDetail = that.data.addressDetail;
    var locationY = that.data.locationY;
    var locationX = that.data.locationX;
    var sexArray = that.data.sexArray;
    var sexKey = that.data.sexKey;
    var sex = sexArray[sexKey].key;

    if (name == '') {
      wx.showToast({
        title: '请填写姓名',
        icon: "none",
        duration: 2000
      })
      return;
    }
    if (phone == '') {
      wx.showToast({
        title: '电话不能为空',
        icon: "none",
        duration: 2000
      })
      return;
    }
    if (phone.length != 11) {
      wx.showToast({
        title: '电话格式不对',
        icon: "none",
        duration: 2000
      })
      return;
    }
    if (addressDetail == '') {
      wx.showToast({
        title: '请填写详细地址',
        icon: "none",
        duration: 2000
      })
      return;
    }
    if (locationY == '' || locationX == '' || address == '') {
      wx.showToast({
        title: '请选择定位地址',
        icon: "none",
        duration: 2000
      })
      return;
    }
    
    if (id == '') { //新建地址
      var address = { "address": address, "name": name, "sex": sex, "locationY": locationY, "locationX": locationX, "phone": phone, "addressDetail": addressDetail };
      that.saveAddressData('https://www.yunquanlai.com/client/api/saveAddress',address);
    } else { //修改地址
      var address = { "id": id,"address": address, "name": name, "sex": sex, "locationY": locationY, "locationX": locationX, "phone": phone, "addressDetail": addressDetail };
      that.saveAddressData('https://www.yunquanlai.com/client/api/saveAddress',address);
    }
    
      wx.navigateBack({
        delta: 1
      })
  },
  deleteAddress: function(e) {
    var id = parseInt(this.data.id);
    wx.showModal({
      title: '提示',
      content: ' 确定要删除改地址？',
      success: function(res) {
        if (res.confirm) {
          util.requestWithToken('https://www.yunquanlai.com/client/api/removeAddress?userAddressId=' + id, '', function success(res) {
            //如果缓存地址和删除地址id一样，清空地址缓存
            let addressSelect = wx.getStorageSync('addressSelect') || [];
            if (addressSelect != '') {
              if (id = addressSelect.id) {
                addressSelect = [];
                wx.setStorage({
                  key: 'addressSelect',
                  data: addressSelect
                })
              }
            }
          });
          wx.navigateBack({
            delta: 1
          })
        } else {

        }
      }
    })
  },
  chooseAddressLocation() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        //console.log(res);
        that.setData({
          locationY: res.longitude,
          locationX: res.latitude,
          address: res.address,
          addressDetail: res.name
        })
      },
    })
  },
  bindNameInput: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindAddressInput: function(e) {
    this.setData({
      addressDetail: e.detail.value
    })
  },
  //打开性别弹窗 
  showSexBox: function() {
    var state = util.modifyPopupBoxState(this.data.showSexBox)
    var textShow = true;
    this.setData({
      showSexBox: state,
      textShow: textShow
    })
  },
  closeSexBox: function() {
    var state = util.modifyPopupBoxState(this.data.showSexBox)
    var textShow = false;
    this.setData({
      showSexBox: state,
      textShow: textShow
    })
  },
  changSexColor: function(e) {
    var index = e.currentTarget.dataset.index;
    let sexArray = this.data.sexArray;
    var name = '选择性别';
    name = sexArray[index].value;
    this.setData({
      sexKey: index,
      sexText: name
    })
    this.closeSexBox();
  },
})