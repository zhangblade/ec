// pages/calls/calls.js
//获取应用实例
const app = getApp()
let util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    type: null,
    commid: null,
    key: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      id: options.id,
      type: options.type,
      commid: options.commid,
    })
  },

  /**
  * 电梯上下键的处理事件
  */
  bindKey: function (e) {
    this.setData({
      key: e.currentTarget.dataset.key,
    });
  },

  bindSubmit: function () {
    //检测是否登录
    if (!util.checkLogon()) {
      wx.showModal({
        title: '提示',
        content: '未授权登录',
        showCancel: false,
        confirmText: '去登录',
        success: function (res) {
          wx.switchTab({
            url: '../my/my',
          })
        }
      })
      return;
    }

    let id = this.data.id
    let type = this.data.type
    let commid = this.data.commid
    let key = this.data.key

    if(key == null || key == ''){
      wx.showModal({
        title: '提示',
        content: '请您选择上线或者下行',
        showCancel: false
      })
      return
    }

    wx.navigateTo({
      url: '../floor/floor?id=' + id + '&type=' + type + '&commid=' + commid + '&key=' + key,
    })
  }
})