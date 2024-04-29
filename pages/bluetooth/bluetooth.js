// pages/bluetooth/bluetooth .js
const app = getApp()
const util = require('../../utils/util.js')
const SIGNAL_SCOPE_MIN = -90
const SIGNAL_SCOPE_MAX = 0
const EXPIRE_TIME = 4000
const DEVICE_CODE_DATA = ['06', '05'] //蓝牙设备标识

Page({

  /**
   * 页面的初始数据
   */
  data: {
    commid:'', //社区id
    eleid: '', //电梯设备ID
    elename: '', //电梯名称
    floors: [], //楼层集合
    tabIndex: -1, //楼层索引
    status: false,
    showExist: false,
    showPrompt: true,
    prompt: '正在加载',
    time: 60,
    deviceData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 页面卸载
   */
  onUnload: function () {
    this.setData({
      floors: [],
      tabIndex: -1,
      status: false,
      showExist: false,
      time: 60
    })
    clearInterval(this.setIntervalId)
    this.stopBluetoothDevicesDiscovery()
    this.closeBluetoothAdapter()
  },

  /**
   * 初始化蓝牙模块
   */
  openBluetoothAdapter: function () {
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
      return
    }
    //初始化数据
    this.setData({
      deviceData: []
    })
    wx.showLoading({
      title: '初始化...',
      mask: true
    })
    wx.openBluetoothAdapter({
      success: (res) => {
        wx.hideLoading()
        //开始搜寻附近的蓝牙外围设备
        this.startBluetoothDevicesDiscovery()
      },
      fail: (err) => {
        wx.hideLoading()
        if (err.errCode == 10001) {
          wx.showModal({
            title: '提示',
            content: '请打开蓝牙',
            showCancel: false
          })
        }
      },
    })
  },
  
  /**
   * 开始搜寻附近的蓝牙外围设备
   */
  startBluetoothDevicesDiscovery: function () {
    let that = this
    wx.showLoading({
      title: '开启搜寻...',
      mask: true
    })
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        wx.hideLoading()
        wx.showLoading({
          title: '正在搜索设备...',
          mask: true
        })
        //需要多次调用
        let setIntervalId = setInterval(function(){
          //获取在蓝牙模块生效期间所有已发现的蓝牙设备
          that.getBluetoothDevices()
        }, 1500)
        //延时定时器
        this.setTimeoutId = setTimeout(function(){
          wx.hideLoading()
          //停止搜寻附近的蓝牙外围设备
          that.stopBluetoothDevicesDiscovery()
          //关闭蓝牙模块
          that.closeBluetoothAdapter()
          //清除定时器
          clearInterval(setIntervalId)
          //获取最终信号最强的设备
          let data = that.data.deviceData
          // console.log("获取到的设备：", data)
          if(data.length > 0){
            let max = data[0].RSSI
            let index = 0
            for (let i = 0; i < data.length; i++){
              let rssi = data[i].RSSI
              if(rssi > max){
                max = rssi
                index = i
              }
            }
            // console.log("最终结果：" , data[index])
            let id = data[index].name.substring(2, 10)
            //获取社区ID
            that.getCommid(id)
          } else {
            wx.showModal({
              title: '提示',
              content: '搜索设备超时',
              showCancel: false
            })
          }
        }, EXPIRE_TIME)
      },
      fail: (err) => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 获取在蓝牙模块生效期间所有已发现的蓝牙设备
   */
  getBluetoothDevices: function () {
    wx.getBluetoothDevices({
      success: (res) => {
        let devices = res.devices
        devices.forEach((device) => {
          let rssi = device.RSSI
          let deviceName = device.name
          //通过指定设备标识循环查找设备
          DEVICE_CODE_DATA.forEach((item) => {
            //信号强度大于规定范围值
            if (rssi > SIGNAL_SCOPE_MIN && rssi < SIGNAL_SCOPE_MAX) {
              let prefix = deviceName.substring(0, 2)
              if (item == prefix) {
                this.data.deviceData.push(device)
              }
            }
          })
        })
      },
      fail: (err) => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 停止搜寻附近的蓝牙外围设备
   */
  stopBluetoothDevicesDiscovery: function () {
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('停止搜寻附近的蓝牙外围设备', res);
      },
      fail: (err) => {
        console.log('停止搜寻附近的蓝牙外围设备失败', err);
      }
    })
  },
  
  /**
   * 关闭蓝牙模块
   */
  closeBluetoothAdapter: function () {
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log('关闭蓝牙模块成功', res)
      },
      fail: (err) => {
        console.log('关闭蓝牙模块失败', err)
      }
    })
  },

  /**
   * 获取社区ID
   */
  getCommid: function(id){
    wx.showLoading({
      title: '加载数据...',
    })
    wx.request({
      method: 'POST',
      url: app.config.webUrl + '/Index/apiForJs',
      data: { 
        mcode: app.constant.getCommid,
        body: '[{"lock_pid": "' + id + '"}]'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        let data = res.data;
        if (data.status == 0) {
          this.setData({
            commid: data.data[0].commid
          })
          //获取电梯权限
          this.getElevatorData(id)
        } else {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: data.info,
            showCancel: false
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: err,
          showCancel: false
        })
      }
    })
  },

  /**
   * 获取电梯权限
   */
  getElevatorData: function (id) {
    let openid = wx.getStorageSync("OPENID")
    let phoneNumber = wx.getStorageSync("PHONENUMBER")
    //获取电梯权限
    wx.request({
      method: "POST",
      url: app.config.webUrl + 'Index/apiForJs',
      data: {
        commid: this.data.commid,
        mcode: app.constant.getElevator,
        body: '[{"phonenumber": "' + phoneNumber + '", "openid": "' + openid + '", "id": "' + id + '", "type": 1}]'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading();
        //开始60s计时
        if(!this.timerInterval){
          this.bindTimer()
        }
        let data = res.data;
        if (data.status == 0) {
          let newArr = [];
          let eleid = data.data[0].eleid;
          let elename = data.data[0].elename
          let floors = data.data[0].floors;
          for (let i = 0; i < floors.length; i++) {
            if (floors[i].au == 1) {
              newArr.push(floors[i])
            }
          }
          //初始化数据
          this.setData({
            showPrompt: false,
            showExist: true,
            eleid: eleid,
            elename: elename,
            floors: newArr,
          })
        } else {
          this.setData({
            showPrompt: true,
            prompt: '暂无数据',
          })
          let msg = data.info
          if (msg.indexOf('0004') > 1) {
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
        this.setData({
          floors: [],
          tabIndex: -1,
          status: false,
          showPrompt: true,
          prompt: '暂无数据',
          time: 60
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
  bindFloorPitch: function (e) {
    //检测是否已选择楼层
    let status = this.data.status;
    if (status) {
      wx.showModal({
        title: '提示',
        content: '已选择楼层',
        showCancel: false
      })
      return;
    }

    let id = e.currentTarget.dataset.id;
    this.setData({
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
        commid: this.data.commid,
        mcode: app.constant.controlElevator,
        body: '[{"phonenumber":"' + phoneNumber + '", "openid":"' + openid + '","eleid":"' + this.data.eleid + '", "floors":[{"id":"' + id + '"}]}]'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading();
        let data = res.data;
        if (data.status == 0) {
          this.setData({
            status: true,
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
  bindReset: function (e) {
    this.setData({
      tabIndex: -1,
      status: false,
    })
    wx.showToast({
      title: '已重置',
    })
  },

  // 倒计时定时器对象
  timerInterval: null,

  /**
   * 倒计时60s
   */
  bindTimer: function () {
    let that = this;
    let nsecond = 60;
    this.timerInterval = setInterval(function () {
      nsecond -= 1;
      that.setData({
        time: nsecond
      })
      if (nsecond < 1) {
        //取消指定的setInterval函数将要执行的代码 
        clearInterval(that.timerInterval)
        that.timerInterval = null
        that.setData({
          floors: [],
          tabIndex: -1,
          status: false,
          showExist: false,
          showPrompt: true,
          prompt: '正在加载',
          time: 60
        })
      }
    }, 1000)
  },
})