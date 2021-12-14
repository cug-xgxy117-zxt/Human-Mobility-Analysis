import React, { Component } from 'react';
import { Radio, Space } from 'antd';
import BottomCalendar from '../calendar/BottomCalendar';
import TimerLine from '../timePlayer/TimerLine';
import ShoppingCart from '../shopping/ShoppingCart';
import './BtmDrawer.scss';
import eventBus, { TRAJBYCLICK } from '@/app/eventBus';
import axios from 'axios';

class BtmDrawer extends Component {
  constructor(props) {
    super(props);
    this.radioContents = [
      { id: 1, text: '日历'},
      { id: 2, text: '时间窗口'},
      { id: 3, text: '时间轴'},
      { id: 4, text: '购物车'},
    ];
    this.state = {
      value: 1,
      selectTrajs: [],
      ShenZhen: null, // 深圳json边界
    }
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    })
  }

  componentDidMount() {
    // 注册鼠标点击监听
    eventBus.on(TRAJBYCLICK, (data) => {
      this.setState(prev => {
        return {selectTrajs: [...prev.selectTrajs, data]}
      })
    })
    // 深圳 json 数据
    axios.get(process.env.PUBLIC_URL + '/ShenZhen.json').then(data => {
      this.setState({ShenZhen: data.data})
    })
  }

  render() {
    return (
      <>
        <div className='btmdrw-radio btmdrw-moudle'>
          <Radio.Group onChange={this.onChange} value={this.state.value}>
            <Space direction="vertical">
              {this.radioContents.map(item => (<Radio value={item.id}>{item.text}</Radio>))}
            </Space>
          </Radio.Group>
        </div>
        {this.state.value === 1 && this.props.date ? <BottomCalendar data={this.props.date} eventName={this.props.EVENTNAME} /> : null}
        {this.state.value === 2 && null}
        {this.state.value === 3 && <TimerLine />}
        <ShoppingCart selectTrajs={this.state.selectTrajs} ShenZhen={this.state.ShenZhen} isSelected={this.state.value === 4} />
      </>
    );
  }
}

export default BtmDrawer;