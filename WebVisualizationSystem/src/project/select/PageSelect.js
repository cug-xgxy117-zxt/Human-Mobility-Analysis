import React, { Component } from 'react';
import "./PageSelect.scss";
import Map from './map/Map';
import Footer from './footer/Footer';
import Left from './charts/left/Left';
import FunctionBar from './function-bar/FunctionBar';
import Bottom from './charts/bottom/Bottom';
import MapSelectBar from './map/mapSelect/MapSelectBar';
// 第三方
import _ from 'lodash';
import { ReloadOutlined } from '@ant-design/icons';
// react-redux
import { connect } from 'react-redux';
import { fetchData, fetchOceanScoreAll, setSelectedUsers } from '@/app/slice/selectSlice';
import Drawer from '@/components/drawer/Drawer';


class PageSelect extends Component {
  functionBarItems = [
    {
      id: 0,
      text: '图表重置',
      icon: <ReloadOutlined />,
      onClick: () => { this.setState({ chartsReload: {} }) },
    }, {
      id: 1,
      text: '日历重置',
      icon: <ReloadOutlined />,
      onClick: () => { this.setState({ calendarReload: {} }) },
    },
    {
      id: 2,
      text: '地图重置',
      icon: <ReloadOutlined />,
      onClick: () => { this.setState({ mapReload: {} }) },
    }
  ]

  constructor(props) {
    super(props);
    this.state = {
      leftWidth: 0, // 左侧栏宽度
      rightWidth: 0, // footer左侧位置
      bottomHeight: 0, //底部内容高度
      bottomWidth: 0, //底部内容宽度
      chartsReload: {},
      calendarReload: {},
      mapReload: {},
    };
  }

  // 取交集
  handleIntersection = (...params) => {
    // 若存在元素不为数组类型，则报错
    let type = params.some(item => !Array.isArray(item));
    if (type) {
      throw new Error('param should be Array Type');
    }

    let result = params.reduce((prev, cur) => {
      if (prev.length === 0) return [...cur];
      if (cur.length === 0) return [...prev];
      return Array.from(new Set(prev.filter(item => cur.includes(item))))
    }, []);
    this.props.setSelectedUsers(result);
  };

  componentDidMount() {
    // 请求数据(伪)
    this.props.fetchData(`${process.env.PUBLIC_URL}/mock/ocean_score.json`);

    // 请求数据(真)
    // this.props.fetchOceanScoreAll();

    //返回各组件的边界位置，用于日历、map等组件的布局
    const leftWidth = document.querySelector('.left').getBoundingClientRect().right;
    const rightWidth = document.querySelector('.footer-bar').getBoundingClientRect().right - document.querySelector('.footer-bar').getBoundingClientRect().left;
    const bottomHeight = document.querySelector('.bottom').getBoundingClientRect().height;
    const bottomWidth = document.querySelector('.bottom').getBoundingClientRect().width;
    this.setState({
      leftWidth: leftWidth,
      rightWidth: rightWidth,
      bottomHeight: bottomHeight,
      bottomWidth: bottomWidth,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_.isEqual(prevProps.selectedByCharts, this.props.selectedByCharts) ||
      !_.isEqual(prevProps.selectedByCalendar, this.props.selectedByCalendar) ||
      !_.isEqual(prevProps.selectedByMap, this.props.selectedByMap)
    ) {
      this.handleIntersection(this.props.selectedByCharts, this.props.selectedByCalendar, this.props.selectedByMap);
    }
  }

  render() {
    return (
      <div className="select-page-ctn">
        <div className="center">
          <Map leftWidth={this.state.leftWidth} bottomHeight={this.state.bottomHeight} rightWidth={this.state.rightWidth}/>
          <div className="inner">
            <div className="top-bracket"></div>
            <div className="bottom">
              <Bottom
                bottomHeight={this.state.bottomHeight}
                bottomWidth={this.state.bottomWidth}
                calendarReload={this.state.calendarReload}
              />
            </div>
          </div>
        </div>
        <div className="left">
          <Left width={this.state.leftWidth} chartsReload={this.state.chartsReload} />
        </div>
        <div className="footer-bar" style={{ float: "right" }} >
          <Drawer
            render={() => (<Footer setRoutes={this.props.setRoutes} />)}
            type="right"
            width={200}
            initVisible={true}
          />
        </div>
        <FunctionBar functionBarItems={this.functionBarItems} left={this.state.leftWidth} />
        <MapSelectBar right={this.state.rightWidth} bottom={this.state.bottomHeight} mapReload={this.state.mapReload} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    selectedByCharts: state.select.selectedByCharts,
    selectedByCalendar: state.select.selectedByCalendar,
    selectedByMap: state.select.selectedByMap,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (url) => dispatch(fetchData(url)),
    fetchOceanScoreAll: () => dispatch(fetchOceanScoreAll()),
    setSelectedUsers: (payload) => dispatch(setSelectedUsers(payload)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PageSelect);