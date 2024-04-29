//app.js
const util = require('utils/util.js')
App({
  onLaunch: function () {
    let that = this;
    wx.checkSession({
      success: function(res) {
        //已登录
      },
      fail: function(res) {
        //未登录
        that.getOpenid();
      },
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  /**
   * getOpenid封装成Promise
   */
  getOpenid: function(){
    let that = this;
    return new Promise(function (resolve, reject) {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey
          if (res.code) {
            //发起网络请求
            wx.request({
              url: that.config.webUrl + '/Suport/jscode2session',
              data: { code: res.code },
              method: 'GET',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                if (res.data) {
                  //将返回openid和session_key 保存至本地缓存
                  let data = res.data;
                  wx.setStorageSync("OPENID", data.openid);
                  wx.setStorageSync("SESSION_KEY", data.session_key);
                  resolve(res.data)
                } else {
                  reject(res.info)
                }
              },
              fail: function(res){
                reject(res.errMsg)
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '登录失败：' + res.errMsg,
              showCancel: false,
            })
          }
        }
      })
    })
  },
  config: {
    webUrl: "https://ec.bosiny.com.cn/wx.php/",
  },
  constant: {
    //接口交易码
    activate: "100102", //激活
    login: "100103",  //登录
    getVerifyCode: "100106",  //获取激活短信验证码
    getCommid: "100114", //获取社区ID
    getElevator: "400160",  //获取电梯权限
    controlElevator: "400161",  //远程遥控电梯

    //设备类型
    dtElevatorInside: 1,  //电梯
    dtElevatorHall: 4,  //电梯大厅
  },
  globalData: {
    userInfo: null,
  },
})