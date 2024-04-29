//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    
  },
  getUserInfo: function (e) {
    if (e.detail.errMsg == "getUserInfo:ok"){
      //保存用户信息
      app.globalData.userInfo = e.detail.userInfo;
      //保存当前登录状态更新为1
      wx.setStorageSync("LOGON_STATE", 1);
      wx.navigateBack({
        delta: 2
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '你已拒绝授权，请重新授权',
        showCancel: false
      })
    }
  }
})
