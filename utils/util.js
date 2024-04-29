const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//是否登录
function checkLogon () {
  let state = wx.getStorageSync("LOGON_STATE");
  if (state == null || state == "" || state == 0) {
    return false;
  }
  return true;
}

function formatTimeDiffer(faultDate, completeTime) {
  var stime = Date.parse(new Date(faultDate));
  var etime = Date.parse(new Date(completeTime));
  var usedTime = etime - stime; //两个时间戳相差的毫秒数
  //计算出小时数
  var time = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  return time;
}

module.exports = {
  formatTime: formatTime,
  formatTimeDiffer: formatTimeDiffer,
  checkLogon: checkLogon
}
