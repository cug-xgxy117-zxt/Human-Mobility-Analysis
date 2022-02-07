import { useEffect, useRef, useReducer, useState } from 'react';

// 轨迹切分
function trajSeparation(data, partnum) {
  if (data) {
    const partlens = Math.ceil(data.length / partnum);
    let start = partlens;
    let res = []
    while (start <= data.length + partlens) {
      res.push(data.slice(0, start));
      start += partlens
    }
    return res;
  } else {
    return [];
  }
}

// 清除单轨迹动效绘制
function clearSingleTraj(chart) {
  chart.setOption({
    series: [{
      name: '静态单轨迹',
      data: [],
    }, {
      name: '动态单轨迹',
      data: [],
    }, {
      name: '出发地',
      data: [],
    }, {
      name: '目的地',
      data: [],
    }, {
      name: '当前点',
      data: [],
    }, {
      name: '历史预测点',
      data: [],
    }, {
      name: '历史预测路径',
      data: [],
    }, {
      name: '当前预测点',
      data: [],
    }]
  })
}

export const usePredict = (chart, traj, { drawOD, drawTraj, drawCurpt }) => {
  // 模拟预测点坐标（后期用真实数据替换）
  function getMockData(val, min, max) {
    if (Array.isArray(val)) {
      return val.map((item, idx) => {
        return getMockData(item, min, max)
      })
    } else {
      return val + Math.random() * (max - min) + min
    }
  }

  /**
  * 历史预测路径展示
  * @param {number[][]} res - 轨迹经纬度坐标 [[lng, lat], ...]
  */
  function histPredictTraj(res) {
    chart.setOption({
      series: [
        {
          name: '历史预测点',
          data: res,
        },
        // {
        //   name: '历史预测轨迹',
        //   data: res,
        // },
        {
          name: '当前预测点',
          data: [{
            value: res.slice(-1)[0],
            itemStyle: {
              color: '#F5F5F5'
            }
          }]
        }
      ]
    })
  }

  // 距离误差展示
  function showDistanceError(des, pre) {
    chart.setOption({
      series: [
        {
          name: '距离可视化',
          data: [{
            coords: [
              pre,  // 起点
              des,   // 终点
            ],
            // 统一的样式设置
            lineStyle: {
            }
          }],
        }
      ]
    })
  }

  // 目的地预测动效计时器
  const timer = useRef(null);

  // 模型面板的预测功能函数
  function predictReducer(state, action) {
    const keys = Object.keys(state);
    keys.forEach(item => state[item] = false)
    switch (action.type) {
      case 'startPredict':
        return {
          ...state,
          startPredict: true
        }
      case 'stopPredict':
        return {
          ...state,
          stopPredict: true
        }
      case 'clearPredict':
        return {
          ...state,
          startPredict: false,
          clearPredict: true
        }
      default:
        return;
    }
  }
  const [predict, predictDispatch] = useReducer(predictReducer, {
    startPredict: false,
    stopPredict: false,
    clearPredict: false,
  })

  // 存储当前轨迹坐标片段
  const [trajPart, setTrajPart] = useState({ idx: 0, coords: [] });

  // 存储历史预测点集合，用于历史预测路径展示
  const [histPreres, setHistPreres] = useState([]);

  // 预测三阶段：开始 / 暂停 / 清除
  useEffect(() => {
    // 生成切分轨迹段
    // --- 后续轨迹切分段可动态设置
    const separationRes = trajSeparation(traj?.data, 30);
    if (separationRes.length === 0 && !chart) return () => { }

    // 开始预测
    // !timer.current 避免重复点击
    if (predict.startPredict && !timer.current) {
      drawOD(chart, traj?.data); // 绘制预测轨迹的 OD 点


      // trajPart 用于记录每次历史动效，方便在暂停后恢复
      if (trajPart.idx < 1) {
        // id 为 0 表明本次为第一次展示
        setTimeout(() => {
          drawTraj(chart, separationRes[0]);
          drawCurpt(chart, separationRes[0]);
        }, 0)

        setTrajPart(({ idx }) => {
          return {
            idx: idx + 1,
            coords: separationRes[0],
          }
        })

        setHistPreres((prev) => {
          let mock = getMockData(traj?.data.slice(-1)[0], 0, 1)
          let data = [...prev, mock];
          setTimeout(() => {
            histPredictTraj(data);
            showDistanceError(traj?.data.slice(-1)[0], data.slice(-1)[0]);
          }, 50);
          return data;
        });
      }

      let i = 0; // 用于生成模拟数据

      timer.current = setInterval(() => {

        setTrajPart(({ idx, coords }) => {
          setTimeout(() => {
            drawTraj(chart, separationRes[idx]);
            drawCurpt(chart, separationRes[idx]);
          }, 0)

          return idx === separationRes.length - 1 ? {
            idx: 0,
            coords: [],
          } : {
            idx: idx + 1,
            coords: separationRes[idx],
          }
        })

        setHistPreres((prev) => {
          if (i === separationRes.length - 1) i = 0;

          let mock = getMockData(separationRes[++i].slice(-1)[0], 0, 0.05);
          let data = [...prev, mock];
          setTimeout(() => {
            histPredictTraj(data);
            showDistanceError(traj?.data.slice(-1)[0], data.slice(-1)[0]);
          }, 50);
          return (i === separationRes.length - 1) ? [] : data;
        });
      }, 1000)
    }

    // 暂停预测
    if (predict.stopPredict) {
      clearInterval(timer.current);
      timer.current = null;
    }

    // 清除预测
    if (predict.clearPredict && trajPart.idx !== 0) {
      // 重置计时器
      clearInterval(timer.current);
      timer.current = null;
      // 清除轨迹
      clearSingleTraj(chart);
      // 重新绘制静态轨迹
      drawTraj(chart, traj?.data);
      drawOD(chart, traj?.data);
      setTrajPart({
        idx: 0,
        coords: [],
      })

      setHistPreres([]);
      showDistanceError([], []);
    }
  }, [trajPart, predict, traj, chart])

  return {
    predictDispatch,
  }
}