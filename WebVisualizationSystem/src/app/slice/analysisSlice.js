import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hourCount: [],
  monthCount: [],
  weekdayCount: [],
  heatmapData: [], // 存储筛选日期下的 week-hour 数据
  monthRange: [], // 存储 week-hour组件中slider选取的月份
  dateRange: [] , // 存储 canlendar筛选的起止日期
  calendarSelected: [], // 存储 时间筛选的轨迹编号
  heatmapSelected: [], // 存储 week-hour筛选的轨迹编号
  characterSelected: [], // 存储 特征筛选的轨迹编号
  finalSelected: [], // 存储 各种筛选后的轨迹编号，并集  
  selectTrajs: [],  // 添加到“轨迹列表”中的轨迹数据集合
  curShowTrajId: -1, // 当前展示的轨迹id
}

const analysisReducer = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setBarData: (state, action) => {
      ['hourCount', 'monthCount', 'weekdayCount'].forEach((item, idx) => {
        state[item] = action.payload[item]
      })
    },
    setMonthRange: (state, action) => {
      state.monthRange = action.payload;
    }, 
    setDateRange: (state, action) => {
      state.dateRange = action.payload
    },
    setHeatmapData: (state, action) => {
      state.heatmapData = action.payload;
    },
    setCalendarSelected: (state, action) => {
      state.calendarSelected = action.payload;
      console.log('calendarSelected:', action.payload)
    },
    setHeatmapSelected: (state, action) => {
      state.heatmapSelected = action.payload;
      console.log('heatmapSelected:', action.payload)
    },
    setCharacterSelected: (state, action) => {
      state.characterSelected = action.payload;
      console.log('characterSelected:', action.payload)
    },
    setFinalSelected: (state, action) => {
      state.finalSelected = action.payload;
      console.log('finalSelected:', action.payload)
    },
    addSelectTrajs: (state, action) => {
      const data = action.payload;
      if (!(state.selectTrajs.some(item => (item.id === data.id)))) {
        state.selectTrajs.push(data);
      }
    },
    delSelectTraj: (state, action) => {
      const id = action.payload;
      if (Array.isArray(id)) {
        state.selectTrajs = state.selectTrajs.filter((item) => (!id.includes(item.id)))
      } else {
        state.selectTrajs = state.selectTrajs.filter((item) => (item.id !== id))
      }
    },
    clearSelectTraj: (state, action) => { state.selectTrajs = [] },
    addImgUrl2SelectTraj: (state, action) => {
      const { id, imgUrl } = action.payload;
      state.selectTrajs = state.selectTrajs.map(item => {
        if (item.id === id) {
          item.imgUrl = imgUrl;
        }
        return item;
      });
    },
    setCurShowTrajId: (state, action) => {
      state.curShowTrajId = action.payload;
    },
  }
})

export const {
  setBarData,
  setDateRange,
  setHeatmapData,
  setCalendarSelected,
  setHeatmapSelected,
  setCharacterSelected,
  setFinalSelected,
  addSelectTrajs,
  delSelectTraj,
  clearSelectTraj,
  addImgUrl2SelectTraj,
  setCurShowTrajId,
} = analysisReducer.actions;

export default analysisReducer.reducer;