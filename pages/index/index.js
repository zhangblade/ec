//index.js
//获取应用实例
const app = getApp()
let util = require('../../utils/util.js')

Page({

  data: {
    
  },
  
  //页面加载时调用
  onLoad: function (options) {
    //扫普通二维码链接进入获取结果 options.q
    let result = decodeURIComponent(options.q);
    if (result != null && result != '' && result != 'undefined') {
      //URL的处理函数
      this.handleUrl(result);
    }
  },

  /**
   * 扫码乘梯
   */
  getScancode: function () {
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
    let that = this;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        //URL的处理函数
        that.handleUrl(res.result);
      }
    })
  },

  /**
   * URL的处理函数
   */
  handleUrl: function(data){
    let index = data.indexOf('{');
    if (index < 0) {
      wx.showModal({
        title: '提示',
        content: '二维码格式不正确',
        showCancel: false
      })
      return;
    }

    let str = data.substring(index, data.length);
    let json = JSON.parse(str);
    let pid = json.pid;
    let dt = json.dt;
    let commid = json.commid;
    // 根据设备类型跳转页面
    if (dt == app.constant.dtElevatorInside) {  //设备类型为电梯
      //跳转至楼层页面
      wx.navigateTo({
        url: '../floor/floor?id=' + pid + '&type=0&commid=' + commid,
      })
    } else if (dt == app.constant.dtElevatorHall) { //设备类型为电梯大厅
      //跳转至呼梯页面
      wx.navigateTo({
        url: '../calls/calls?id=' + pid + '&type=2&commid=' + commid,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '暂不支持该设备',
        showCancel: false
      })
    }
  },
})
