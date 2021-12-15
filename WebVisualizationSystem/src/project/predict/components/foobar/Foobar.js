import React from 'react';
import "./Foobar.scss";
import PredictFrame from './predict-frame/PredictFrame';
import PoiFrame from './poi-frame/PoiFrame';
import ModelFrame from './model-frame/ModelFrame';
import HistAndCur from './model-frame/HistAndCur';

const Model1 = (props) => {
  return (
    <div>1</div>
  )
}

const Model3 = (props) => {
  return (
    <div>3</div>
  )
}


const Foobar = (props) => {
  const {
    // 预测
    onPredictDispatch,
    // poi查询
    poi,
    onPoi,
    poiField,
    setPoiField,
  } = props;

  const options = [
    {
      name: 'model1',
      component: <Model1 />
    },
    {
      name: '历史-当前',
      component: <HistAndCur />
    },
    {
      name: 'model3',
      component: <Model3 />
    }
  ]

  return (
    <div className="foobar-ctn">
      <PoiFrame state={poi} setState={onPoi} poiInfo={poiField} setPoiInfo={setPoiField} />
      <ModelFrame options={options} />
      <PredictFrame onPredictDispatch={onPredictDispatch} />
    </div>
  )
}

export default Foobar;