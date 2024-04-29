// pages/floor/floor.js
const app = getApp();
let util = require('../../utils/util.js')

//楼层是否有权限
let FLOOR_AU_0 = 0;//无
let FLOOR_AU_1 = 1;//有
//设备类型
let FLOOR_TYPE_0 = 0;//电梯
let FLOOR_TYPE_2 = 2;//电梯大厅
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    type: '',
    commid: '',
    key: '',
    elename: '',
    time: 60,
    floors: [],
    tabIndex: -1,
    showPrompt: true,
    promptText: '正在加载',
    floorState: false,
  },

  /**
   * 页面加载时调用
   */
  onLoad: function (options) {
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
    //初始化数据
    this.setData({
      id: options.id,
      type: options.type,
      commid: options.commid,
      key: options.key
    })
    //页面加载时开启倒计时60s
    this.bindCountDowm();
    //初次加载时获取openid返回不及时处理
    let that = this;
    let openid = wx.getStorageSync("OPENID");
    if (openid == '' || openid == null || openid == 'undefined'){
      app.getOpenid().then(function (res) {
        let openid = wx.getStorageSync("OPENID");
        that.getFloorList(openid)
      });
    }else{
      that.getFloorList(openid)
    }
  },

  /**
   * 倒计时60s
   */
  bindCountDowm: function () {
    let that = this;
    let nsecond = 60;
    var appCountDown = setInterval(function () {
      nsecond -= 1;
      that.setData({
        time: nsecond
      })
      if (nsecond < 1) {
        //取消指定的setInterval函数将要执行的代码 
        clearInterval(appCountDown);
        wx.navigateBack({
          delta: 2,
        })
      }
    }, 1000)
  },

  /**
   * 获取电梯权限
   */
  getFloorList: function(openid){
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })

    let phoneNumber = wx.getStorageSync("PHONENUMBER");
    let id = that.data.id;
    let type = that.data.type;
    let body = '[{"phonenumber":"' + phoneNumber +'", "openid":"' + openid + '", "id":"' + id + '", "type":' + type + '';
    if (type == FLOOR_TYPE_2) {
      let key = that.data.key;
      body += ', "key":' + key + '';
    }
    body += '}]';
    //获取电梯权限
    wx.request({
      method: "POST",
      url: app.config.webUrl + 'Index/apiForJs',
      data: {
        commid: that.data.commid,
        mcode: app.constant.getElevator,
        body: body
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        let data = res.data;
        if (data.status == 0) {
          let newArr = [];
          let elename = data.data[0].elename;
          let floors = data.data[0].floors;
          for(let i = 0; i < floors.length; i++){
            if(floors[i].au == 1){
              newArr.push(floors[i])
            }
          }
          //初始化数据
          that.setData({
            showPrompt: false,
            elename: elename,
            floors: newArr,
          })
        } else {
          that.setData({
            showPrompt: true,
            promptText: '暂无数据',
          })
          let msg = data.info
          if(msg.indexOf('0004') > 1){
            msg = '没有电梯通行授权，请与管理员联系'
          }
          wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        that.setData({
          showPrompt: true,
          promptText: '暂无数据',
        })
        wx.showModal({
          title: '提示',
          content: '通讯失败',
          showCancel: false
        })
      }
    })
  },

  /**
   * 楼层点击选中的处理事件
   */
  bindActive: function(e){
    //检查该楼层是否有权限 au （0 无， 1 有） 
    let au = e.currentTarget.dataset.au;
    if (au == FLOOR_AU_0){
      return;
    }
    //检测是否已选择楼层
    let floorState = this.data.floorState;
    if(floorState){
      wx.showModal({
        title: '提示',
        content: '已选择楼层',
        showCancel: false
      })
      return;
    }

    let id = e.currentTarget.dataset.id;
    let that = this;
    that.setData({
      tabIndex: id,
    })

    wx.showLoading({
      title: '加载中...',
    })
    let phoneNumber = wx.getStorageSync("PHONENUMBER");
    let openid = wx.getStorageSync("OPENID");
    //远程遥控电梯
    wx.request({
      method: "POST",
      url: app.config.webUrl + 'Index/apiForJs',
      data: {
        commid: that.data.commid,
        mcode: app.constant.controlElevator,
        body: '[{"phonenumber":"' + phoneNumber + '", "openid":"' + openid + '","eleid":"' + that.data.id +'", "floors":[{"id":"'+ id +'"}]}]'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        let data = res.data;
        if (data.status == 0) {
          that.setData({
            floorState: true,
          })
          wx.showToast({
            title: '成功',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: data.info,
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
  },

  /**
   * 重新选层处理函数
   */
  bindReset: function(e){
    this.setData({
      tabIndex: -1,
      floorState: false,
    })
    wx.showToast({
      title: '已重置',
    })
  }
})