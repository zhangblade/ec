// pages/my/my.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    userInfo: null,
    phoneNumber: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      app.userInfoReadyCallback = res => {
        this.setData({
          hasUserInfo: true,
          userInfo: app.globalData.userInfo,
          phoneNumber: wx.getStorageSync("PHONENUMBER")
        })
      }
    }else{
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            hasUserInfo: true,
            userInfo: res.userInfo,
            phoneNumber: wx.getStorageSync("PHONENUMBER")
          })
        }
      })
    }
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    let state = wx.getStorageSync("LOGON_STATE");
    if(state == 1){
      this.setData({
        hasUserInfo: true,
        userInfo: app.globalData.userInfo,
        phoneNumber: wx.getStorageSync("PHONENUMBER")
      });
    }
  },

  /**
   * 获取手机号码
   */
  getPhoneNumber: function(e){
    let that = this;
    //检测用户是否允许授权手机号码
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      let sessionKey = wx.getStorageSync("SESSION_KEY");
      let openid = wx.getStorageSync("OPENID");
      //用户数据进行解密
      wx.request({
        url: app.config.webUrl + "Suport/wxDecryptData",
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: sessionKey,
        },
        success: function (res) {
          let phoneNumber = res.data.phoneNumber;
          //保存本地缓存手机号码
          wx.setStorageSync("PHONENUMBER", phoneNumber);
          //检测激活会员ID,该用户是否已激活
          let sessid = wx.getStorageSync("SESSID");
          if(sessid != null && sessid != ''){
            // 检测用户信息是否已授权
            if (app.globalData.userInfo == null) {
              //跳转至用户信息授权页
              wx.navigateTo({
                url: '../login/login',
              })
            } else {
              //保存当前登录状态更新为1
              wx.setStorageSync("LOGON_STATE", 1);
              that.setData({
                hasUserInfo: true
              })
            }
          }else{
            //跳转至注册激活页
            wx.navigateTo({
              url: '../register/register',
            })
          }
        },
        fail: function(res){
          wx.showModal({
            title: '提示',
            content: '通讯失败',
            showCancel: false
          })
        }
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '你已拒绝授权，请重新授权',
        showCancel: false
      })
    }
  },

  /**
   * 退出登录
   */
  logout: function(){
    //保存当前登录状态更新为0
    wx.setStorageSync("LOGON_STATE", 0);
    this.setData({
      hasUserInfo: false
    });
  }
})