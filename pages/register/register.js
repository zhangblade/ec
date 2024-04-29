// pages/register/register.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: null,
    verify: null,
    password: null,
    isSend: false,
    second: 60,
    text: '获取验证码'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      phoneNumber: wx.getStorageSync("PHONENUMBER")
    })
  },

 /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (){
    this.setData({
      phoneNumber: wx.getStorageSync("PHONENUMBER")
    })
  },

  /**
   * 监听input 验证码
   */
  getInputVerify: function (e) {
    this.setData({
      verify: e.detail.value
    })
  },

  /**
   * 监听input 手机号码
   */
  getInputPhoneNumber: function(e){
    this.setData({
      phoneNumber: e.detail.value
    })
  },

 /**
   * 监听input 密码
   */
  getInputPassword: function(e){
    this.setData({
      password: e.detail.value
    })
  },

  /**
   * 获取验证码
   */
  bindVerify: function (e){
    //检测是否已发送验证码
    if(this.data.isSend){
      return;
    }

    //检测手机号码是否正确
    let phoneNumber = this.data.phoneNumber;
    let phoneNumberReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (phoneNumber == null || phoneNumber == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号码',
        showCancel: false
      })
      return;
    } else if (!phoneNumberReg.test(phoneNumber)) {
      wx.showModal({
        title: '提示',
        content: '手机号码格式不正确',
        showCancel: false
      })
      return;
    }

    let that = this;
    wx.showLoading({
      title: '发送中...',
    })
    wx.request({
      method: "POST",
      url: app.config.webUrl + "Index/apiForjs",
      data: {
        mcode: app.constant.getVerifyCode,
        body: '[{"phonenumber":"' + this.data.phoneNumber + '"}]'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        let data = res.data;
        if (data.status == 0) {
          wx.showToast({
            title: '发送成功',
          })
          //倒计时60s
          let nsecond = 60;
          var appCountDown = setInterval(function(){
            nsecond -= 1;
            that.setData({
              isSend: true,
              second: '重新发送('+ nsecond + 's)'
            })
            if(nsecond < 1){
              //取消指定的setInterval函数将要执行的代码 
              clearInterval(appCountDown);
              that.setData({
                isSend: false,
                text: '重新发送'
              })
            }
          }, 1000)
        } else {
          wx.showModal({
            title: '提示',
            content: data.info,
            showCancel: false,
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '通讯失败',
          showCancel: false
        })
      }
    })
  },

  /**
   * 激活登录处理函数
   */
  bindActivateLogin: function (e){
    let verify = this.data.verify;
    let phoneNumber = this.data.phoneNumber;
    let password = this.data.password;

    //验证手机号码非空
    let phoneNumberReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (phoneNumber == null || phoneNumber == ''){
      wx.showModal({
        title: '提示',
        content: '请输入手机号码',
        showCancel: false
      })
      return;
    } else if (!phoneNumberReg.test(phoneNumber)){
      wx.showModal({
        title: '提示',
        content: '手机号码格式不正确',
        showCancel: false
      })
      return;
    }

    //校验验证码
    let verifyReg = /^\d{6}$/;
    if (verify == null || verify == '') {
      wx.showModal({
        title: '提示',
        content: '请输入六位数验证码',
        showCancel: false
      })
      return;
    } else if (!verifyReg.test(verify)){
      wx.showModal({
        title: '提示',
        content: '验证码格式不正确',
        showCancel: false
      })
      return;
    }
    
    //验证密码非空
    if(password == null || password == ''){
      wx.showModal({
        title: '提示',
        content: '请输入密码',
        showCancel: false
      })
      return;
    }
    wx.showLoading({
      title: '加载中...',
    })
    let openid = wx.getStorageSync("OPENID");
    //激活
    wx.request({
      method: "POST",
      url: app.config.webUrl + "Index/apiForjs",
      data: {
        mcode: app.constant.activate,
        body: '[{"openid":"' + openid + '", "phonenumber":"' + phoneNumber + '", "password":"' + password + '", "verify":"' + verify + '"}]'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        if(res){
          let data = res.data;
          if (data.status == 0) {
            //保存激活会话ID到本地缓存
            wx.setStorageSync("SESSID", data.data[0].sessid);
            wx.navigateTo({
              url: '../login/login',
            })
          } else {
            wx.showModal({
              title: '提示',
              content: data.info,
              showCancel: false,
            })
          }
        }else{
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '获取数据失败',
            showCancel: false
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '通讯失败',
          showCancel: false
        })
      }
    })
  }
})